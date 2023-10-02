import json
from bson.json_util import dumps
from pymongo import MongoClient, InsertOne
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh"]
collection = db["housewares"]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root(terms: str = ""):
    bson = collection.find(filter = 
                             {"name":{"$regex": terms, "$options": "ix"}}, 
                             projection = {"name":1,"image":1,"variations":1,"_id":0}, 
                             limit = 200) 
    #print(list(result))
    
    #if result:
        # Convert ObjectId to str for JSON serialization
    #    result["_id"] = str(result["_id"])
    result = json.loads(dumps(bson))
    for item in result:
        if "image" not in item:
            item["image"] = item["variations"][1]["image"]
    return result
    #return {"message": "Hello World"}


