import json
from pymongo import MongoClient, InsertOne

client = MongoClient("mongodb://localhost:27017/")

db = client["acnh-furnitures"]
collections = db.list_collection_names()

def unionPipeline(collection_name):
    return {
        "$unionWith": {
            "coll": collection_name,
            "pipeline": [
                {
                    "$addFields": {
                        "category": collection_name
                    }
                }
            ]
        }
    }

# exclude the first collection from the pipeline
pipeline = [unionPipeline(c) for c in collections[1:]]

results = list(db[collections[0]].aggregate([
    {
        "$addFields":{
            "category": collections[0]
        }
    },
    *pipeline
]))

db["Furnitures"].insert_many(results)

client.close()
