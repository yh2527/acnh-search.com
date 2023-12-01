# Goal: find out if any item has different kit types across variations
from pymongo import MongoClient, InsertOne

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

has_variations = list(collection.find({"variations": {"$exists": True}}))

diff_concept = []

for e in has_variations:
    if "variations" in e:
        check_concept = ''
        for v in e["variations"]:
            if "kitType" in v:
                if not check_concept:
                    check_concept = v["kitType"]
                elif check_concept != v["kitType"]:
                    diff_concept.append(e["name"])
                print(e["name"],check_concept,v["kitType"])
print(len(diff_concept))
# output: 0 which means all variations for each item have the same kit type


has_variations = list(collection.find({"$and":[{"variations": {"$exists": True}},{"kitType": {"$exists":False}}]}))
# 2246 which means all items with variations didn't have kitType field
print(len(has_variations)) #2246
print(type(has_variations[0]))
print(has_variations[0]["name"])

'''
count = 0
for p in has_variations:
    if "variations" in p:
        if "kitType" in p["variations"][0]:
            print(p["name"])
            kitType = p["variations"][0]["kitType"]
            collection.update_one({'_id': p['_id']}, {'$set': {'kitType': kitType}})
            count += 1
print(f"{count} records updated") #1214 records updated
'''
# 2246 - 1214 = 1032 all clothings, not customizable 
client.close()
