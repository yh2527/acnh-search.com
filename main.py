import json
import pymongo
import re
from bson.json_util import dumps
from pymongo import MongoClient, InsertOne
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
'''
collection.find({
    "columnA": {
        "$in": [1, 2],
        "$nin": [3, 4]
    }
})
'''

@app.get("/")
def root(category: str = "", search: str = "", limit: int = 40, page: int = 1, tag: str = '', size:
         str = '', interact: str = ''):
    search = re.escape(search)
    offset = (page - 1) * limit

    criteria = {"name":{"$regex": search, "$options": "ix"}}
    if category:
        criteria["category"] = category
    if size:
        criteria["size"] = size
    if interact:
        criteria["interact"] = interact
    
    tag = json.loads(tag or '{}')
    tagIn = []
    tagOut = []
    if tag:
        for tagName in tag:
            tagFlag = tag.get(tagName, 0)
            if tagFlag == '1':
                tagIn.append(tagName)
            elif tagFlag == '-1':
                tagOut.append(tagName)
    tag_criteria = {}
    if tagIn:
        tag_criteria["$in"] = tagIn
    if tagOut:
        tag_criteria["$nin"] = tagOut
    if tag_criteria:
        criteria['tag'] = tag_criteria
    #print(f'{tag}, {criteria}')
    
    total_count = collection.count_documents(criteria)
    
    bson = collection.find(filter = criteria, projection =
                           {"name":1,"category":1,"image":1,"variations":1,"size":1,"tag":1,"source":1,"colors":1,"interact":1,"_id":0}, 
                           skip = offset, limit = limit,
                           sort=[("name",pymongo.ASCENDING)],collation=pymongo.collation.Collation(locale="en", caseLevel=True))
    
    # Convert ObjectId to str for JSON serialization
    #result["_id"] = str(result["_id"])
    result = json.loads(dumps(bson))
    # result is a list of json/dictionaries
    
    # result transformation #
    for item in result:
        item["name"] = item["name"].capitalize()
        item["image"] = item.get("image") or item["variations"][0]["image"]
        if "variations" in item:
            item["variations_info"] = {}
            for v in item["variations"]:
                if v["variation"] not in item["variations_info"]:
                    item["variations_info"][v["variation"]] = {}
                item["variations_info"][v["variation"]][v.get("pattern")]={'image':v["image"],'colors':v["colors"]}
    #if result and "variations_info" in result[0]:
    #    print(result[0]["variations_info"])

    return {"result":result,
            "page_info":{"total_count":total_count,"max_page":-(total_count//-limit)}}
    #return {"message": "Hello World"}

""" item["variations_info"] exmaple with patterns -
{'Dark wood': 
    {None: {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_0_0.png', 'colors': ['Brown', 'Brown']}, 
    'Southwestern flair': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_0_1.png', 'colors': ['Brown', 'Colorful']}, 
    'Geometric print': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_0_2.png', 'colors': ['Brown', 'Colorful']}, 
    'Bears': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_0_3.png', 'colors': ['Brown', 'Brown']}, 
    'Quilted': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_0_4.png', 'colors': ['Brown', 'Aqua']}
    }, 
'Orange wood': {None: {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_1_0.png', 'colors': ['Orange', 'Orange']}, 'Southwestern flair': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_1_1.png', 'colors': ['Orange', 'Colorful']}, 'Geometric print': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_1_2.png', 'colors': ['Orange', 'Colorful']}, 'Bears': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_1_3.png', 'colors': ['Orange', 'Brown']}, 'Quilted': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_1_4.png', 'colors': ['Orange', 'Aqua']}}, 'White wood': {None: {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_2_0.png', 'colors': ['Beige', 'Beige']}, 'Southwestern flair': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_2_1.png', 'colors': ['Beige', 'Colorful']}, 'Geometric print': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_2_2.png', 'colors': ['Beige', 'Colorful']}, 'Bears': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_2_3.png', 'colors': ['Beige', 'Brown']}, 'Quilted': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_2_4.png', 'colors': ['Beige', 'Aqua']}}, 'White birch': {None: {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_3_0.png', 'colors': ['White', 'White']}, 'Southwestern flair': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_3_1.png', 'colors': ['White', 'Colorful']}, 'Geometric print': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_3_2.png', 'colors': ['White', 'Colorful']}, 'Bears': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_3_3.png', 'colors': ['White', 'Brown']}, 'Quilted': {'image': 'https://acnhcdn.com/latest/FtrIcon/FtrLogTableL_Remake_3_4.png', 'colors': ['White', 'Aqua']}}}
"""
