# Goal: find out if any item has different kit types across variations
from pymongo import MongoClient, InsertOne

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

has_variations = list(collection.find({"variations": {"$exists": True}}))

'''
diff = []
for e in has_variations:
    if "variations" in e:
        check = 0
        for v in e["variations"]:
            if "cyrusCustomizePrice" in v:
                if not check:
                    check = v["cyrusCustomizePrice"]
                elif check != v["cyrusCustomizePrice"]:
                    diff.append(e["name"])
                print(e["name"],check,v["cyrusCustomizePrice"])
print(len(diff))
'''
# output: 0 which means all variations for each item have the same kit type


#has_variations = list(collection.find({"$and":[{"variations": {"$exists": True}},{"kitType": {"$exists":False}}]}))
# 2246 which means all items with variations didn't have kitType field
print(len(has_variations)) #2246
print(type(has_variations[0]))
print(has_variations[0]["name"])

count = 0
for p in has_variations:
    if "variations" in p:
        if "cyrusCustomizePrice" in p["variations"][0]:
            print(p["name"])
            cyrusCustomizePrice = p["variations"][0]["cyrusCustomizePrice"]
            collection.update_one({'_id': p['_id']}, {'$set': {'cyrusCustomizePrice': cyrusCustomizePrice}})
            count += 1
print(f"{count} records updated") #1214 records updated
# 2246 - 1214 = 1032 all clothings, not customizable 
client.close()
