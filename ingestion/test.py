import json
from pymongo import MongoClient, InsertOne

client = MongoClient("mongodb://localhost:27017/")

db = client["acnh"]
collection = db["housewares"]

with open(r"../source-json/json/data/Housewares.json") as f:
    items = json.load(f)

#result = collection.bulk_write([InsertOne(item) for item in items])
result = collection.bulk_write(list(map(lambda item: InsertOne(item), items)))
print(client.list_database_names())
client.close()
