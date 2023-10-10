import json
from pymongo import MongoClient, InsertOne

client = MongoClient("mongodb://localhost:27017/")

db = client["acnh-furnitures"]
#collections = db.list_collection_names()
collections = [
  'Housewares',
  'Miscellaneous',
  'Wall-mounted',
  'Wallpaper',
  'Floors',
  'Rugs',
  'Fencing',
  'Tools-Goods',
  'Ceiling Decor',
  'Interior Structures',
];

fishBugs = db.Fish.distinct("name") + db.Insects.distinct("name")
exceptions = ['grand Atlas moth model', 'M. sunset moth model', "grand Q. A. birdwing model", "R. Brooke's birdwing model",
 'grand b. dragonfly model', 'citrus long-horned b. model', 'earth-boring dung b. model', 'grand giraffe stag model',
 'grand goliath beetle model', 'grand h. hercules model']

def unionPipeline(collection_name):
    return {
        "$unionWith": {
            "coll": collection_name,
            "pipeline": [
                {
                    "$addFields": {
                        "category": {
                            "$switch": {
                                "branches": [
                                    {
                                        "case": {
                                            "$in": ["$recipe.category", ["Savory", "Sweet"]]
                                        },
                                        "then": "Cooking"
                                    },
                                    {
                                        "case": {
                                            "$in": [{"$substrBytes": 
                                                     ["$name", 0, { "$subtract": [{ "$strLenBytes":"$name" }, 6]}]}, fishBugs]
                                        },
                                        "then": "Models"
                                    },
                                    {
                                        "case": {
                                            "$in": ["$name", exceptions]
                                        },
                                        "then": "Models"
                                    },
                                ],
                                "default": collection_name
                            }
                        }
                    }
                }
            ]
        }
    }
# exclude the first collection from the pipeline
pipeline = [unionPipeline(c) for c in collections]

results = list(db["nullCollection"].aggregate([
    {
        "$addFields":{
            "category": collections[0]
        }
    },
    *pipeline
]))

db["Furnitures"].insert_many(results)

client.close()
