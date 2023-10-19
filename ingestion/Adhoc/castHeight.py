from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

result = collection.update_many(
  { "height": { "$exists": True, "$type": "string" } },
  [
    {
      "$set": {
        "height": {
          "$convert": {
            "input": "$height",
            "to": "double",
            "onError": "$height" # Keep the original string if it can't be converted
          }
        }
      }
    }
  ]
)
print(result.modified_count) #1927
client.close()
