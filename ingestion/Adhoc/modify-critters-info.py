import json
from pymongo import MongoClient, InsertOne

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

critters = list(collection.find(filter = {"category":"Fish/Insects"}))
print(len(critters)) #200
print(type(critters[0]))

for p in critters:
        collection.update_one({'_id': p['_id']}, {'$set': {'category': 'Critters'}})
        if p.get('lightingType',None):
            collection.update_one({'_id': p['_id']}, {'$set': {'interact': True}})
