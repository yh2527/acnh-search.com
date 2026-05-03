import json
import pymongo
import re
from bson.json_util import dumps
from pymongo import MongoClient, InsertOne
from langdetect import detect

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

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

projection = {
    "name": 1, "category": 1, "image": 1, "furnitureImage": 1,"buy":1,
    "variations_info": 1, "diy_info": 1,"seasonEvent": 1,"exchangePrice":1, "exchangeCurrency":1,
    "size": 1, "tag": 1, "source": 1, "colors": 1, "interact": 1, "height": 1,
    "url": 1, "series": 1, "surface": 1, 'kitCost':1, 'kitType':1, "patternCustomize":1,
    "translations.cNzh": 1, "bodyCustomize":1, "customPattern":1, "sablePattern":1,
    "concepts":1, "lightingType":1,"villagerEquippable":1, "cyrusCustomizePrice":1,
    "speakerType":1,"storageImage":1,"themes":1,"styles":1,'sourceSheet':1,"_id": 0
}


def build_criteria(category='', search='', size='', interact='', colors='', surface='',
                   excludeClothing='', source='', season='', series='', lightingType='',
                   speakerType='', minHeight=-1, maxHeight=-1, body='', pattern='',
                   custom='', sable='', concept='', rug='', theme='', style='',
                   type='', equippable='', v3Only='', tag=''):
    """Build MongoDB filter criteria and collation from search/filter params.
    Returns (criteria, collation_to_use, tag_value)."""

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

    if category:
        criteria["category"] = category
    if size:
        criteria["size"] = size
    if interact:
        if interact == "True":
            interact = True
        criteria["interact"] = interact
    if colors:
        colors = colors.split(',')
        color_criteria = [{'colors':{'$all':colors}},{"variations":{"$elemMatch":{"colors":{"$all":colors}}}}]
        criteria['$and'] = [{'$or': color_criteria}]
    if source:
        criteria['source'] = source
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
        elif season == "New Year's Day":
            season_criteria = [{"seasonEvent":{'$regex':re.escape("Shōgatsu"), '$options': 'ix'}},
                               {"seasonEvent":{'$regex':re.escape(season), '$options': 'ix'}}]
            if '$and' in criteria:
                criteria['$and'].append({'$or':season_criteria})
            else:
                criteria['$and'] = [{'$or': season_criteria}]
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
            season_criteria = [
                {'seasonEvent': regex_pattern},
                {"recipe.source": season}
            ]
            if '$and' in criteria:
                criteria['$and'].append({'$or':season_criteria})
            else:
                criteria['$and'] = [{'$or': season_criteria}]
    if series:
        criteria["series"] = series
    if concept:
        concept_criteria = [{'concepts': concept},{"variations":{"$elemMatch":{"concepts": concept}}}]
        if '$and' in criteria:
            criteria['$and'].append({'$or':concept_criteria})
        else:
            criteria['$and'] = [{'$or': concept_criteria}]
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
    if body:
        if body == "True":
            body_criteria = [{'bodyTitle':{'$ne':None}},
                             {'$and':[{'category':'Equipments'},{'variations':{'$ne':None}}]}]
        else:
            body_criteria = [{'$and':[{'category':{'$ne':'Equipments'}},{'bodyTitle':None}]},
                             {'$and':[{'category':'Equipments'},{'variations':None}]}]
        if '$and' in criteria:
            criteria['$and'].append({'$or':body_criteria})
        else:
            criteria['$and'] = [{'$or': body_criteria}]
    if equippable:
        criteria["villagerEquippable"] = True if equippable == "True" else False
    if pattern:
        criteria["patternCustomize"] = True if pattern == "True" else {'$ne': True}
    if custom:
        criteria["customPattern"] = True if custom == "True" else {'$ne': True}
    if sable:
        criteria["sablePattern"] = True if sable == "True" else {'$ne': True}
    if minHeight >= 0:
        if maxHeight < 0:
            maxHeight = 100
    elif maxHeight >= 0:
        minHeight = 0
    if minHeight >= 0 and maxHeight >= 0:
        criteria['height'] = { "$gte": minHeight, "$lte": maxHeight }
    if lightingType:
        criteria["lightingType"] = lightingType
    if speakerType:
        criteria["speakerType"] = speakerType
    if rug:
        criteria["tag"] = rug
        criteria["category"] = "Rugs"
    if theme:
        criteria["themes"] = theme
    if style:
        criteria["styles"] = style
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
    if v3Only:
        v3_criteria = {'versionAdded': '3.0.0'}
        if '$and' in criteria:
            criteria['$and'].append(v3_criteria)
        else:
            criteria['$and'] = [v3_criteria]
    if tag:
        criteria['tag'] = {'$in':tag_matches[tag]}

    return criteria, collation_to_use


def mongo_query(category: str = "", search: str = "", limit: int = 40, page: int = 1, tag: str = '', size: str = '',
                interact: str = '', colors: str = '', surface: str = '', excludeClothing: str = '',
                source: str = '', season: str = '', series: str = '', lightingType: str = '', speakerType: str = '',
                minHeight: int = -1, maxHeight: int =-1, body: str = '', pattern: str = '', custom: str = '', sable: str = '',
                concept: str = '', rug: str = '', theme: str = '', style: str = '', type: str = '', equippable: str = '', v3Only: str = ''):

    offset = (page - 1) * limit

    criteria, collation_to_use = build_criteria(
        category=category, search=search, size=size, interact=interact, colors=colors,
        surface=surface, excludeClothing=excludeClothing, source=source, season=season,
        series=series, lightingType=lightingType, speakerType=speakerType, minHeight=minHeight,
        maxHeight=maxHeight, body=body, pattern=pattern, custom=custom, sable=sable,
        concept=concept, rug=rug, theme=theme, style=style, type=type, equippable=equippable,
        v3Only=v3Only, tag=tag
    )

    if tag:
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
