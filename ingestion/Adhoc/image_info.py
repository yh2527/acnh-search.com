# Goal: find out if any item has different kit types across variations
from pymongo import MongoClient, InsertOne

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

has_image = list(collection.find({"image": {"$exists": True}}))
#all_records = list(collection.find())
print(len(has_image)) #1635
#print(len(all_records)) #4536


count = 0
for item in collection.find():
    if "image" not in item:
        item_image = None
        if item.get("furnitureImage"):
            item_image = item["furnitureImage"]
        elif item.get("storageImage"):
            item_image = item["storageImage"]
        elif item.get("variations") and isinstance(item.get("variations"), list) and len(item.get("variations")) > 0:
            variations = item.get("variations")
            if variations[0].get("image"):
                item_image = variations[0]["image"]
            elif variations[0].get("storageImage"):
                item_image = variations[0]["storageImage"]
        print(item["name"])
        collection.update_one({'_id': item['_id']}, {'$set': {'image': item_image}})
        count += 1
print(f"{count} records updated")
client.close()
