# This code is not used because queried data already has recipe field
import json
from pymongo import MongoClient, InsertOne

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
"""
acnh-furnitures> db.Recipes.distinct("category")
[
  'Ceiling Decor', 'Equipment',
  'Floors',        'Housewares',
  'Miscellaneous', 'Other',
  'Rugs',          'Savory',
  'Sweet',         'Tools',
  'Wall-mounted',  'Wallpaper'
]
"""

tags = db.Furnitures.distinct("tag")
print(tags)
'''Identify fish/insects model
fb = db.Fish.distinct("name") + db.Insects.distinct("name")
items = db.Furnitures.distinct("name",{ "category": { "$in": ["Models"] }})
items = [e[:-6] for e in items]
print([e for e in fb if e not in items])
'''

'''Identify cooking items
filterValue = ["Savory", "Sweet"];
cookings = db.Recipes.distinct("name",{ "category": { "$in": filterValue }})
items = db.Furnitures.distinct("name",{ "category": { "$in": ["Cooking"] }})
print(len(cookings))
print(len(items))
print([e for e in cookings if e not in items])
'''
# Output: ['brown sugar', 'flour', 'sugar', 'whole-wheat flour']
# Materials
"""
db.Furnitures.updateMany(
   {
      name: { $in: cookings },
   },
   {
      $set: { category: "Cooking" }
   }
);
"""
#db["Furnitures"].insert_many(results)

client.close()

