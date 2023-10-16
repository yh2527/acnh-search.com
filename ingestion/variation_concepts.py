# Goal: find out if any item has different concepts among variations
import json
from pymongo import MongoClient, InsertOne
from bson.json_util import dumps

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

bson = collection.find(projection = {"name":1, "variations":1,"_id":0})
result = json.loads(dumps(bson))

diff_concept = []
for e in result:
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

client.close()
