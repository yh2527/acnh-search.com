# Goal: find out if any item has different kit types across variations
from pymongo import MongoClient, InsertOne

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

#has_variations = list(collection.find({"variations": {"$exists": True}}))

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


has_variations = list(collection.find({"$and":[{"variations": {"$exists": True}},{"exchangeCurrency": {"$exists":False}}]}))
# 2246 which means all items with variations didn't have kitType field
print(len(has_variations)) #2246
print(type(has_variations[0]))
print(has_variations[0]["name"])

'''
count_curr = 0
count_price = 0
count_season = 0
for p in has_variations:
    if "variations" in p:
        if "exchangeCurrency" in p["variations"][0]:
            exchangeCurrency = p["variations"][0]["exchangeCurrency"]
            collection.update_one({'_id': p['_id']}, {'$set': {'exchangeCurrency': exchangeCurrency}})
            count_curr += 1
        if "exchangePrice" in p["variations"][0]:
            exchangePrice = p["variations"][0]["exchangePrice"]
            collection.update_one({'_id': p['_id']}, {'$set': {'exchangePrice': exchangePrice}})
            count_price += 1
        if "seasonEvent" in p["variations"][0]:
            seasonEvent = p["variations"][0]["seasonEvent"]
            collection.update_one({'_id': p['_id']}, {'$set': {'seasonEvent': seasonEvent}})
            count_season += 1
print(f"{count_curr} records updated") #2236 records updated (10 fences not included)
print(f"{count_price} records updated") #2236 records updated (10 fences not included)
print(f"{count_season} records updated") #2246 records updated
'''
client.close()
