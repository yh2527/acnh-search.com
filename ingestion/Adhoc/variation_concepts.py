# Goal: find out if any item has different concepts among variations
from pymongo import MongoClient, InsertOne

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

has_variations = list(collection.find({"variations": {"$exists": True}}))

diff_concept = []

for e in has_variations:
    if "variations" in e:
        check_concept = []
        for v in e["variations"]:
            if "concepts" in v:
                if not check_concept:
                    check_concept = v["concepts"][:]
                elif len(check_concept) != len(v["concepts"]):
                    diff_concept.append(e["name"])
                else:
                    for c in v["concepts"]:
                        print(check_concept, c)
                        if c not in check_concept:
                            diff_concept.append(e["name"])
print(len(diff_concept))
# output: 0

has_variations = list(collection.find({"$and":[{"variations": {"$exists": True}},{'category':{"$ne":
                                                                                              'Equipments'}},{"concepts": {"$exists":False}}]}))
print(len(has_variations)) #2246
print(type(has_variations[0]))
print(has_variations[0]["name"])
'''
count = 0
for p in has_variations:
    if "variations" in p:
        if "concepts" in p["variations"][0]:
            print(p["name"])
            concepts = p["variations"][0]["concepts"]
            collection.update_one({'_id': p['_id']}, {'$set': {'concepts': concepts}})
            count += 1
print(f"{count} records updated") #1192 records updated
'''
# 2246 - 1192 = 1054
# 1054 - 1032 clothing - 10 fences - 12 interior structures
client.close()
