import json
import os
from pymongo import MongoClient, InsertOne

client = MongoClient("mongodb://localhost:27017/")

db = client["acnh-furnitures"]

path = "../source-json/rawdata/data/Clothing/"
file_names = [f for f in os.listdir(path) if os.path.isfile(os.path.join(path,f)) and f[0]!="."]
#print(file_names)

for filename in file_names:
    #print(filename)
    collection = db[filename[:-5]]
    with open(fr"{path}{filename}") as f:
        items = json.load(f)
        #result = collection.bulk_write([InsertOne(item) for item in items])
        result = collection.bulk_write(list(map(lambda item: InsertOne(item), items)))

print(client.list_database_names())
client.close()
