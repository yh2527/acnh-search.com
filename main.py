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
         str = ''):
    search = re.escape(search)
    offset = (page - 1) * limit
    criteria = {"name":{"$regex": search, "$options": "ix"}}
    
    if category:
        criteria["category"] = category

    if size:
        criteria["size"] = size
    
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
    print(f'{tag}, {criteria}')
    
    total_count = collection.count_documents(criteria)
    bson = collection.find(filter = criteria, projection =
                           {"name":1,"image":1,"variations":1,"size":1,"tag":1,"_id":0}, 
                           skip = offset, limit = limit,
                           sort=[("name",pymongo.ASCENDING)],collation=pymongo.collation.Collation(locale="en", caseLevel=True))
    # Convert ObjectId to str for JSON serialization
    #result["_id"] = str(result["_id"])
    result = json.loads(dumps(bson))
    # result is a list of json/dictionaries
    for item in result:
        item["name"] = item["name"].capitalize()
        item["image"] = item.get("image") or item["variations"][0]["image"]
    return {"result":result,
            "page_info":{"total_count":total_count,"max_page":-(total_count//-limit)}}
    #return {"message": "Hello World"}
