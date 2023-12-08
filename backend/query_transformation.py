import json
import pymongo
import re
from bson.json_util import dumps
from pymongo import MongoClient, InsertOne
from langdetect import detect
from backend.mongo_query import mongo_query

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

def query_transformation(bson: dict, total_count: int = 0, limit: int = 40):

    # Convert ObjectId to str for JSON serialization
    #result["_id"] = str(result["_id"])
    result = json.loads(dumps(bson))
    # result is a list of json/dictionaries
    

    # result transformation #
    #for item in result:
    for i in range(len(result)):
        # keep only entries with not empty values
        result[i] = {k:v for k, v in result[i].items() if v is not None}
        result[i]["name"] = result[i]["name"].capitalize()
        ''' ### made permanent change to the image field in db
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
        '''
        result[i]["colors"] = list(set(filter(lambda x: x is not None, result[i].get("colors", []))))

        if "themes" in result[i]:
            result[i]["themes"] = list(set(filter(lambda x: x is not None, result[i].get("themes", []))))
        if "styles" in result[i]:
            result[i]["styles"] = list(set(filter(lambda x: x is not None, result[i].get("styles", []))))
        if "height" in result[i]:
            result[i]["height"] = round(result[i]["height"],1)
        ''' ### made permanent addition to the variations_info field in db
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
        '''
        ''' ### made permanent addition to the diy_info field in db
        if item.get("recipe",None) or item.get("category", None) == "Interior Structures":
            if item["category"] == "Interior Structures":
                item_materials = db["Recipes"].find_one(filter={'name':{'$regex': item['name'], '$options': 'i'}},projection=
                                                        {'materials':1,'source':1,"_id":0})
                #print('materials', item_materials)
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
        '''
    #print("first result ",result[0])
    return {"result":result,
            "page_info":{"total_count":total_count,"max_page":-(total_count//-limit)}}

