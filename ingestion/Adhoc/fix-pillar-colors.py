from pymongo import MongoClient
from bson.json_util import dumps
import json

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

interiors = list(collection.find(filter = {"category":"Interior Structures"}))
print(len(interiors))
print(type(interiors[0]))
"""
for p in interiors:
    if "variations" in p:
        for i in range(len(p["variations"])):
            new_color = []
            new_color.append(p["variations"][i]["color1"])
            new_color.append(p["variations"][i]["color2"])
            field_name = f"variations.{i}.colors"
            collection.update_one({'_id': p['_id']}, {'$set': {field_name: new_color}})
    else:
        new_color = []
        new_color.append(p["color1"])
        new_color.append(p["color2"])
        collection.update_one({'_id': p['_id']}, {'$set': {'colors': new_color}})
"""
                             
