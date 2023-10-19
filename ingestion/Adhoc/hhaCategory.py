# Goal: explore the hhaCategory field
import json
from pymongo import MongoClient, InsertOne
from bson.json_util import dumps

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

bson = collection.find(projection = {"name":1, "hhaCategory":1,"variations":1,"_id":0})
result = json.loads(dumps(bson))

no_hha = set()
for e in result:
    if "variations" in e:
        for v in e["variations"]:
            if "hhaCategory" not in v or not v["hhaCategory"]:
                no_hha.add(e["name"])
    else:
        if "hhaCategory" not in e or not e["hhaCategory"]:
            no_hha.add(e["name"])

print(no_hha)
print(len(no_hha))
# output: 2293

client.close()
