import json
from pymongo import MongoClient, InsertOne

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

# changing category from Fish/Insects to Critters
'''
critters = list(collection.find(filter = {"category":"Fish/Insects"}))
print(len(critters)) #200
print(type(critters[0]))

for p in critters:
    collection.update_one({'_id': p['_id']}, {'$set': {'category': 'Critters'}})
    if p.get('lightingType',None):
        collection.update_one({'_id': p['_id']}, {'$set': {'interact': True}})
'''

# add source/tag info for critters
fish = db["Fish"]
bugs = db["Insects"]
sea = db["Sea Creatures"]
critters = list(collection.find(filter = {"category":"Critters"}))
print(len(critters)) #200
print(type(critters[0]))
count = 0
for p in critters:
    if fish.find_one({'name': p['name']}):
        collection.update_one({'_id': p['_id']}, {'$set': {'tag': 'Fish'}})
        count += 1
    elif bugs.find_one({'name': p['name']}):
        collection.update_one({'_id': p['_id']}, {'$set': {'tag': 'Insect'}})
        count += 1
    elif sea.find_one({'name': p['name']}):
        collection.update_one({'_id': p['_id']}, {'$set': {'tag': 'Sea Creatures'}})
        count += 1
print("number of entreis modified:", count) #200
