from pymongo import MongoClient
import json

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

#has_variations = list(collection.find({"variations": {"$exists": True}}))
# returns 2246
#has_variations = list(collection.find({"$and":[{"variations": {"$exists": True}},{"surface": {"$exists":True}}]}))
# returns 0 

has_variations = list(collection.find({"$and":[{"variations": {"$exists": True}},{"surface":
                                                                                  {"$exists":False}}]}))
# returns 1214 which is 2246 - 1032

print(len(has_variations))
print(type(has_variations[0]))
print(has_variations[100]["name"])

"""
count = 0
for p in has_variations:
    if "variations" in p:
        if "surface" in p["variations"][0]:
            print(p["name"])
            surface = p["variations"][0]["surface"]
            collection.update_one({'_id': p['_id']}, {'$set': {'surface': surface}})
            count += 1
print(f"{count} records updated") #1032 records updated
"""                          
