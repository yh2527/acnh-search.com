import json
import pymongo
import re
from bson.json_util import dumps
from pymongo import MongoClient, InsertOne
from langdetect import detect

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

def mongo_query(category: str = "", search: str = "", limit: int = 40, page: int = 1, tag: str = '', size: str = '', 
                interact: str = '', colors: str = '', surface: str = '', excludeClothing: str = '',
                source: str = '', season: str = '', series: str = '', lightingType: str = '', speakerType: str = '', 
                minHeight: int = -1, maxHeight: int =-1, body: str = '', pattern: str = '', custom: str = '', sable: str = '', 
                concept: str = '', rug: str = '', theme: str = '', style: str = '', type: str = '', equippable: str = ''):

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
        elif season == "Children's Day":
            criteria['seasonEvent'] = "Children's Day"
        elif season == "Wedding Season":
            criteria['seasonEvent'] = "Wedding Season"
        elif season == "Wedding Season Shopping":
            criteria['seasonEvent'] = {"$in": ["Wedding Season (Able Sisters)", "Wedding Season (Nook Shopping 1)", "Wedding Season (Nook Shopping 2)"]}
        elif season == "New Year's Eve":
            criteria['seasonEvent'] = {"$in": ["New Year's Eve", "New Year's Eve (Russia)",
                                               "Silvester", "Nochevieja"]}
        elif season == "Toy Day":
            season_criteria = [{"seasonEvent":"Festive shopping"},
                               {"seasonEvent":{'$regex':re.escape(season), '$options': 'ix'}}]
            if '$and' in criteria:
                criteria['$and'].append({'$or':season_criteria})
            else:
                criteria['$and'] = [{'$or': season_criteria}]
        else:
            season = re.escape(season)
            regex_pattern = {'$regex': season, '$options': 'ix'}
            print("debug season", regex_pattern)
            print("debug season", re.compile(season, re.IGNORECASE))
            season_criteria = [
                {'seasonEvent': regex_pattern},
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
    if excludeClothing:
        excludeClothing_criteria = {'category':{'$ne':'Equipments'}}
        if '$and' in criteria:
            criteria['$and'].append(excludeClothing_criteria)
        else:
            criteria['$and'] = [excludeClothing_criteria]
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
            "name": 1, "category": 1, "image": 1, "furnitureImage": 1,"buy":1,
            "variations_info": 1, "diy_info": 1,"seasonEvent": 1,"exchangePrice":1, "exchangeCurrency":1,
                "size": 1, "tag": 1, "source": 1, "colors": 1, "interact": 1, "height": 1,
                "url": 1, "series": 1, "surface": 1, 'kitCost':1, 'kitType':1, "patternCustomize":1,
                "translations": 1, "bodyCustomize":1, "customPattern":1, "sablePattern":1,
                "concepts":1, "lightingType":1,"villagerEquippable":1, "cyrusCustomizePrice":1, 
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
    print('total count', total_count)
    
    return bson, total_count
