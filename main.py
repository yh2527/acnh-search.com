import json
import pymongo
import re
from bson.json_util import dumps
from pymongo import MongoClient, InsertOne
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langdetect import detect

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

@app.get("/")
def root(category: str = "", search: str = "", limit: int = 40, page: int = 1, tag: str = '', size:
         str = '', interact: str = '', colors: str = '', surface: str = '', height: str = '',
         source: str = '', season: str = '', series: str = '', lightingType: str = '', speakerType: str = '', minHeight: int = -1,
         maxHeight: int =-1, body: str = '', pattern: str = '', custom: str = '', sable: str = ''):
    
    offset = (page - 1) * limit
    
    # text search EN/ZH
    def is_chinese(input_string):
        for char in input_string:
            if '\u4e00' <= char <= '\u9fff':
                return True
        return False
    if is_chinese(search):
        collation_to_use = pymongo.collation.Collation(locale="zh")
        criteria = {"translations.cNzh":{"$regex": search, "$options": "i"}}
    else:
        collation_to_use = pymongo.collation.Collation(locale="en", caseLevel=True)
        search = re.escape(search)
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
        color_criteria = [{'colors':{'$all':colors}},{"variations":{"$elemMatch":{"colors":{"$all":colors}}}}]
        criteria['$and'] = [{'$or': color_criteria}]
    # source
    if source:
        criteria['source'] = source 
    # seasonal
    if season:
        if season == "Celeste":
            criteria['recipe.source'] = season
        else:
            regex_pattern = re.compile(season, re.IGNORECASE)
            season_criteria = [
                {'seasonEvent': regex_pattern},
                {"variations": {"$elemMatch": {'seasonEvent': regex_pattern}}},
                {"recipe.source": season}
            ]
            if '$and' in criteria:
                criteria['$and'].append({'$or':season_criteria})
            else:
                criteria['$and'] = [{'$or': season_criteria}]
    # series
    if series:
        criteria["series"] = series
    # surface
    if surface:
        if surface == "True":
            surface_criteria = [
                {'surface': True},
                {"variations": {"$elemMatch": {"surface": True}}}
            ]
            if '$and' in criteria:
                criteria['$and'].append({'$or':surface_criteria})
            else:
                criteria['$and'] = [{'$or': surface_criteria}]
        else:
            surface_criteria = [
                {'surface': {'$ne': True}},
                {"variations.surface": {'$ne': True}}
            ]
            if '$and' in criteria:
                criteria['$and'].append({'$and':surface_criteria})
            else:
                criteria['$and'] = [{'$and': surface_criteria}]
    # body            
    if body:
        criteria["bodyTitle"] = {'$ne': None} if body == "True" else None
    # pattern            
    if pattern:
        criteria["patternCustomize"] = True if pattern == "True" else {'$ne': True}
    # custom            
    if custom:
        criteria["customPattern"] = True if custom == "True" else {'$ne': True}
    # sable            
    if sable:
        criteria["sablePattern"] = True if sable == "True" else {'$ne': True}
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
            'Events & Franchise':['Cinnamoroll','Compass','Easter','Hello Kitty','Kerokerokeroppi','Kiki & Lala','Mario','My Melody','Pompompurin','Seasonal Decor'],
            'Seating':['Chair','Sofa'],
            'Space Dividers':['Arch','Screen'],
            'Storage & Display':['Chest','Dresser','Shelf'],
            'Table':['Desk','Table'],
            'Travel & Transit':['Seaside','Space','Vehicle']
            }
    ### Fields that will be returned fron the mongoDB querry ###
    projection = {
                "name": 1, "category": 1, "image": 1, "furnitureImage": 1, "variations": 1,
                "size": 1, "tag": 1, "source": 1, "colors": 1, "interact": 1, "height": 1,
                "url": 1, "series": 1, "surface": 1, 'recipe':1, 'kitCost':1, "patternCustomize":1,
                "bodyCustomize":1, "_id": 0
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
            '$project': projection
        },
        {
            '$skip': offset
        },
        {
            '$limit': limit
        }]
        bson = collection.aggregate(pipeline, collation=collation_to_use)
    else:
        bson = collection.find(filter = criteria, projection = projection, skip = offset, limit = limit,
                               sort=[("name",pymongo.ASCENDING)], collation = collation_to_use)
    print("criteria at total count", criteria)
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
        if item.get("recipe",None):
            item["diy_info"] = {}
            for m in list(item['recipe']['materials'].keys()):
                if m not in item["diy_info"]:
                    item["diy_info"][m] = {}
                item["diy_info"][m]['amount'] = item['recipe']['materials'][m]
                icon = db["Other"].find_one(filter={'name':m},projection= {'inventoryImage':1,"_id":0})
                if icon:
                    item["diy_info"][m].update(icon)
                else:
                    more_icons = collection.find_one(filter={'name':m},projection=
                                                     {'image':1,'iconImage':1,'variations':1,"_id":0})
                    if "variations" in more_icons:
                        icon = more_icons['variations'][0]['image']
                    else:
                        icon = more_icons.get('image',more_icons.get('iconImage',None))
                    item["diy_info"][m].update({'inventoryImage':icon})

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
