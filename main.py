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


@app.get("/macode")
def another_page(color: str = '', limit: int = 40):
    #criteria = {"colors":color}
    criteria = {}
    bson = db["MACode"].find(filter = criteria)
    total_count = db["MACode"].count_documents(criteria)
    result = json.loads(dumps(bson))
    return {"result":result,
            "page_info":{"total_count":total_count,"max_page":-(total_count//-limit)}}

@app.get("/")
def root(category: str = "", search: str = "", limit: int = 40, page: int = 1, tag: str = '', size:
         str = '', interact: str = '', colors: str = '', surface: str = '', height: str = '',
         source: str = '', season: str = '', series: str = '', lightingType: str = '', speakerType: str = '', minHeight: int = -1,
         maxHeight: int =-1, body: str = '', pattern: str = '', custom: str = '', sable: str = '',
         concept: str = '', rug: str = '', theme: str = '', style: str = '', type: str = '',
         equippable: str = ''):
    
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
        if season == "Constellation":
            criteria['recipe.source'] = "Celeste"
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
    # concept
    if concept:
        concept_criteria = [{'concepts': concept},{"variations":{"$elemMatch":{"concepts": concept}}}]
        if '$and' in criteria:
            criteria['$and'].append({'$or':concept_criteria})
        else:
            criteria['$and'] = [{'$or': concept_criteria}]
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
        if body == "True":
            #criteria["bodyTitle"] = {'$ne': None} if body == "True" else None
            body_criteria = [{'bodyTitle':{'$ne':None}},
                             {'$and':[{'category':'Equipments'},{'variations':{'$ne':None}}]}]
        else:
            body_criteria = [{'$and':[{'category':{'$ne':'Equipments'}},{'bodyTitle':None}]},
                             {'$and':[{'category':'Equipments'},{'variations':None}]}]
        if '$and' in criteria:
            criteria['$and'].append({'$or':body_criteria})
        else:
            criteria['$and'] = [{'$or': body_criteria}]
    # equippable            
    if equippable:
        criteria["villagerEquippable"] = True if equippable == "True" else False
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
    # rug
    if rug:
        criteria["tag"] = rug
        criteria["category"] = "Rugs"
    # clothing Theme
    if theme:
        criteria["themes"] = theme
    # clothing Style
    if style:
        criteria["styles"] = style
    # clothing Type
    if type:
        type_criteria = {'$and':[{'category':'Equipments'},{'sourceSheet':type}]}
        if '$and' in criteria:
            criteria['$and'].append(type_criteria)
        else:
            criteria['$and'] = [type_criteria]
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
            'Adventure & Transit':['Seaside','Space','Vehicle']
            }
    ### Fields that will be returned fron the mongoDB querry ###
    projection = {
                "name": 1, "category": 1, "image": 1, "furnitureImage": 1, "variations": 1,
                "size": 1, "tag": 1, "source": 1, "colors": 1, "interact": 1, "height": 1,
                "url": 1, "series": 1, "surface": 1, 'recipe':1, 'kitCost':1, "patternCustomize":1,
                "translations": 1, "bodyCustomize":1, "customPattern":1, "sablePattern":1,
                "concepts":1, "lightingType":1,"villagerEquippable":1,
                "speakerType":1,"storageImage":1,"themes":1,"styles":1,'sourceSheet':1,"_id": 0
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
        print('name', item["name"])
        
        item_image = None
        if item.get("image"):
            item_image = item["image"]
        elif item.get("furnitureImage"):
            item_image = item["furnitureImage"]
        elif item.get("storageImage"):
            item_image = item["storageImage"]
        elif item.get("variations") and isinstance(item.get("variations"), list) and len(item.get("variations")) > 0:
            variations = item.get("variations")
            if variations[0].get("image"):
                item_image = variations[0]["image"]
            elif variations[0].get("storageImage"):
                item_image = variations[0]["storageImage"]
        item["image"] = item_image
        
        item["colors"] = list(set(filter(lambda x: x is not None, item.get("colors", []))))
        
        if "themes" in item:
            item["themes"] = list(set(filter(lambda x: x is not None, item.get("themes", []))))
        if "styles" in item:
            item["styles"] = list(set(filter(lambda x: x is not None, item.get("styles", []))))

        if "height" in item:
            item["height"] = round(item["height"],1)
        
        if "variations" in item:
            item["variations_info"] = {}
            for v in item["variations"]:
                if v["variation"] not in item["variations_info"]:
                    item["variations_info"][v["variation"]] = {}
                if item["category"] == "Equipments":
                    v_image = v["storageImage"]
                else:
                    v_image = v["image"]
                item["variations_info"][v["variation"]][v.get("pattern")]={
                        'image':v_image,
                        'colors':list(set(filter(lambda x: x is not None, v.get("colors", [])))),
                        'variantTranslations': v.get("variantTranslations", None),
                        'patternTranslations': v.get("patternTranslations", None)
                        }
        if item.get("recipe",None) or item.get("category", None) == "Interior Structures":
            if item["category"] == "Interior Structures":
                item_materials = db["Recipes"].find_one(filter={'name':{'$regex': item['name'], '$options': 'i'}},projection=
                                                        {'materials':1,'source':1,"_id":0})
                print('materials', item_materials)
            else:
                item_materials = item['recipe']
            item["diy_info"] = {'source':item_materials['source'],'materials':{}}

            for m in list(item_materials['materials'].keys()):
                if m not in item["diy_info"]['materials']:
                    item["diy_info"]['materials'][m] = {}
                item["diy_info"]['materials'][m]['amount'] = item_materials['materials'][m]
                if "Bell" in m:
                    find_material = "Bell bag" 
                elif "turnips" in m:
                    find_material = "turnips" 
                else:
                    find_material = m
                icon = db["Other"].find_one(filter={'name':find_material},projection=
                                            {'inventoryImage':1,'translations':1,"_id":0})
                if icon:
                    item["diy_info"]['materials'][m].update(icon)
                else:
                    more_icons = collection.find_one(filter={'name':find_material},projection=
                                                     {'image':1,'iconImage':1,'variations':1,'translations':1,"_id":0})
                    if more_icons:
                        if "variations" in more_icons:
                            icon = more_icons['variations'][0]['image']
                        else:
                            icon = more_icons.get('image',more_icons.get('iconImage',None))
                        item["diy_info"]['materials'][m].update({'inventoryImage':icon,
                                                    'translations':more_icons.get('translations',None)})
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
