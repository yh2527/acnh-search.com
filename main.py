import json
import pymongo
import re
from bson.json_util import dumps
from pymongo import MongoClient, InsertOne
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
'''
collection.find({
    "columnA": {
        "$in": [1, 2],
        "$nin": [3, 4]
    }
})
'''

@app.get("/")
def root(category: str = "", search: str = "", limit: int = 40, page: int = 1, tag: str = '', size:
         str = '', interact: str = '', colors: str = '', surface: str = '', height: str = '',
         series: str = '', lightingType: str = '', speakerType: str = '', minHeight: int = -1,
         maxHeight: int =-1):
    #print("page info", page, limit)
    search = re.escape(search)
    offset = (page - 1) * limit
    # text search
    criteria = {"name":{"$regex": search, "$options": "ix"}}
    # category
    if category:
        criteria["category"] = category
    # size
    if size:
        criteria["size"] = size
    # interaction
    if interact:
        if interact == "True":
            interact = True
        criteria["interact"] = interact
    # colors
    if colors:
        colors = colors.split(',') # convert string into array
        criteria['$or'] = [{'colors':{'$all':colors}},{"variations":{"$elemMatch":{"colors":{"$all":colors}}}}]
    # series
    if series:
        criteria["series"] = series
    # surface
    if surface:
        if surface == "True":
            criteria['$or'] = [
                {'surface': True},
                {"variations": {"$elemMatch": {"surface": True}}}
            ]
        else:
            criteria['$and'] = [
                {'surface': {'$ne': True}},
                {"variations.surface": {'$ne': True}}
            ]
    # height
    #print("height ranges", minHeight, maxHeight)
    if minHeight >= 0:
        if maxHeight < 0:
            maxHeight = 100
    elif maxHeight >= 0:
        minHeight = 0
    if minHeight >= 0 and maxHeight >= 0:
        criteria['height'] = { "$gte": minHeight, "$lte": maxHeight }
    # ligthingType
    if lightingType:
        criteria["lightingType"] = lightingType
    # speakerType
    if speakerType:
        criteria["speakerType"] = speakerType
    # tag
    tag_matches = {
            'Appliances':['Air Conditioning','Fan','Fireplace','Heating','Home Appliances','TV'],
            'Audiovisual':['Audio', 'Game Console'],
            'Bath & Hygiene':['Bathroom Things','Bathtub','Toilet'],
            'Bed':['Bed'],
            'Business & Civic': ['Facility Decor','Hospital','Museum','Office','School','Shop','Study','Supplies'],
            'Cultural & Decor':['Folk Craft Decor','Japanese Style'],
            'Door Decor':['House Door Decor'],
            'Drinks':['DishDrink'],
            'Food':['DishFood'],
            'Kitchen & Dining':['Dining','Kitchen','Kitchen Things'],
            'Lights':['CeilingLamp','Lamp'],
            'Musical Instrument':['Musical Instrument'],
            'Outdoor & Natural':['Garden','Ranch'],
            'Plants':['Plants'],
            'Recreation & Play':['Animal','Playground','Special Fish','Special Insect','Sports','Toy'],
            'Seasonal & Franchise':['Cinnamoroll','Compass','Easter','Hello Kitty','Kerokerokeroppi','Kiki & Lala','Mario','My Melody','Pompompurin','Seasonal Decor'],
            'Seating':['Chair','Sofa'],
            'Space Dividers':['Arch','Screen'],
            'Storage & Display':['Chest','Dresser','Shelf'],
            'Table':['Desk','Table'],
            'Travel & Transit':['Seaside','Space','Vehicle']
            }
    if tag:
        criteria['tag'] = {'$in':tag_matches[tag]}
        pipeline = [
        {
            '$match': criteria
        },
        {
            '$addFields': {
                'tag_order': {
                    '$indexOfArray': [tag_matches[tag], '$tag']
                }
            }
        },
        {
            '$sort': {
                'tag_order': 1,
                'name': 1
            }
        },
        {
            '$project': {
                "name": 1, "category": 1, "image": 1, "furnitureImage": 1, "variations": 1,
                "size": 1, "tag": 1, "source": 1, "colors": 1, "interact": 1, "height": 1,
                "url": 1, "series": 1, "surface": 1, "_id": 0
            }
        },
        {
            '$skip': offset
        },
        {
            '$limit': limit
        }]
        bson = collection.aggregate(pipeline, collation=pymongo.collation.Collation(locale="en", caseLevel=True))
    else:
        bson = collection.find(filter = criteria, projection =
                               {"name":1,"category":1,"image":1,"furnitureImage":1,"variations":1,"size":1,"tag":1,"source":1,"colors":1,"interact":1,"height":1,"url":1,"series":1,"surface":1,"_id":0}, 
                               skip = offset, limit = limit,
                               sort=[("name",pymongo.ASCENDING)],collation=pymongo.collation.Collation(locale="en", caseLevel=True))
    print("criteria before total count", criteria)
    total_count = collection.count_documents(criteria)
    print(total_count)
    # Convert ObjectId to str for JSON serialization
    #result["_id"] = str(result["_id"])
    result = json.loads(dumps(bson))
    # result is a list of json/dictionaries
    
    # result transformation #
    for item in result:
        item["name"] = item["name"].capitalize()
        if "series" in item:
            item["series"] = item["series"] and item["series"].capitalize()
        item["image"] = item.get("image") or item.get("furnitureImage") or item.get("variations")[0]["image"]
        if "height" in item:
            item["height"] = round(item["height"],1)
        if "variations" in item:
            item["variations_info"] = {}
            for v in item["variations"]:
                if v["variation"] not in item["variations_info"]:
                    item["variations_info"][v["variation"]] = {}
                item["variations_info"][v["variation"]][v.get("pattern")]={'image':v["image"],'colors':v.get("colors",None)}
    #if result and "variations_info" in result[0]:
        #print(result[0]["variations_info"])
    #print("first result ",result[0])
    return {"result":result,
            "page_info":{"total_count":total_count,"max_page":-(total_count//-limit)}}
    #return {"message": "Hello World"}

""" item["variations_info"] exmaple with patterns -
{'Dark wood': 
    {None: {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_0_0.png', 'colors': ['Brown', 'Brown']}, 
    'Southwestern flair': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_0_1.png', 'colors': ['Brown', 'Colorful']}, 
    'Geometric print': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_0_2.png', 'colors': ['Brown', 'Colorful']}, 
    'Bears': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_0_3.png', 'colors': ['Brown', 'Brown']}, 
    'Quilted': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_0_4.png', 'colors': ['Brown', 'Aqua']}
    }, 
'Orange wood': {None: {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_1_0.png', 'colors': ['Orange', 'Orange']}, 'Southwestern flair': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_1_1.png', 'colors': ['Orange', 'Colorful']}, 'Geometric print': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_1_2.png', 'colors': ['Orange', 'Colorful']}, 'Bears': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_1_3.png', 'colors': ['Orange', 'Brown']}, 'Quilted': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_1_4.png', 'colors': ['Orange', 'Aqua']}}, 'White wood': {None: {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_2_0.png', 'colors': ['Beige', 'Beige']}, 'Southwestern flair': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_2_1.png', 'colors': ['Beige', 'Colorful']}, 'Geometric print': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_2_2.png', 'colors': ['Beige', 'Colorful']}, 'Bears': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_2_3.png', 'colors': ['Beige', 'Brown']}, 'Quilted': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_2_4.png', 'colors': ['Beige', 'Aqua']}}, 'White birch': {None: {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_3_0.png', 'colors': ['White', 'White']}, 'Southwestern flair': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_3_1.png', 'colors': ['White', 'Colorful']}, 'Geometric print': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_3_2.png', 'colors': ['White', 'Colorful']}, 'Bears': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_3_3.png', 'colors': ['White', 'Brown']}, 'Quilted': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_3_4.png', 'colors': ['White', 'Aqua']}}}
"""
