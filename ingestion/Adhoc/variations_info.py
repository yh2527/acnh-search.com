from pymongo import MongoClient, InsertOne

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

has_variations = list(collection.find({"variations": {"$exists": True}}))
#2246


#has_variations = list(collection.find({"$and":[{"variations": {"$exists": True}},{"kitType": {"$exists":False}}]}))
# 2246 which means all items with variations didn't have kitType field
print(len(has_variations)) #2246
print(type(has_variations[0]))
print(has_variations[0]["name"])

count = 0

for p in has_variations:
    print(p["name"])
    if "variations" in p:
        variations_info = {}
        for v in p["variations"]:
            variation = 'null' if v.get("variation", None) is None else str(v["variation"])
            if variation not in variations_info:
                variations_info[variation] = {}
            if p["category"] == "Equipments":
                v_image = v["storageImage"]
            else:
                v_image = v["image"]
            pattern = 'null' if v.get("pattern", None) is None else str(v["pattern"])
            variations_info[variation][pattern]={
                    'image':v_image,
                    'colors':list(set(filter(lambda x: x is not None, v.get("colors", [])))),
                    'variantTranslations': v.get("variantTranslations", None),
                    'patternTranslations': v.get("patternTranslations", None)
                    }
        collection.update_one({'_id': p['_id']}, {'$set': {'variations_info': variations_info}})
        count += 1
print(f"{count} records updated") #2246 records updated

client.close()
