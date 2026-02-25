from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.mongo_query import mongo_query
from backend.query_transformation import query_transformation
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel
import json
import re
from bson.json_util import dumps
from pymongo import MongoClient

app = FastAPI()
app.add_middleware(GZipMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

projection = {
    "name": 1, "category": 1, "image": 1, "furnitureImage": 1, "buy": 1,
    "variations_info": 1, "diy_info": 1, "seasonEvent": 1, "exchangePrice": 1, "exchangeCurrency": 1,
    "size": 1, "tag": 1, "source": 1, "colors": 1, "interact": 1, "height": 1,
    "url": 1, "series": 1, "surface": 1, "kitCost": 1, "kitType": 1, "patternCustomize": 1,
    "translations.cNzh": 1, "bodyCustomize": 1, "customPattern": 1, "sablePattern": 1,
    "concepts": 1, "lightingType": 1, "villagerEquippable": 1, "cyrusCustomizePrice": 1,
    "speakerType": 1, "storageImage": 1, "themes": 1, "styles": 1, "sourceSheet": 1, "_id": 0
}

def transform_items(result):
    for item in result:
        item["name"] = item["name"].capitalize()
        item["colors"] = list(set(filter(lambda x: x is not None, item.get("colors", []))))
        if "themes" in item:
            item["themes"] = list(set(filter(lambda x: x is not None, item.get("themes", []))))
        if "styles" in item:
            item["styles"] = list(set(filter(lambda x: x is not None, item.get("styles", []))))
        if "height" in item:
            item["height"] = round(item["height"], 1)
    return result

class InventoryRequest(BaseModel):
    keys: list[str]

def parse_keys(keys):
    conditions = []
    for key in keys:
        parts = key.split("|", 1)
        if len(parts) == 2:
            conditions.append({"name": {"$regex": f"^{re.escape(parts[0])}$", "$options": "i"}, "sourceSheet": parts[1]})
    return conditions

@app.post("/inventory")
def inventory_lookup(req: InventoryRequest):
    if not req.keys or len(req.keys) > 5000:
        return {"result": [], "page_info": {"total_count": 0, "max_page": 1}}

    or_conditions = parse_keys(req.keys)
    if not or_conditions:
        return {"result": [], "page_info": {"total_count": 0, "max_page": 1}}

    bson = collection.find(filter={"$or": or_conditions}, projection=projection, sort=[("name", 1)])
    result = json.loads(dumps(bson))
    result = transform_items(result)

    return {"result": result, "page_info": {"total_count": len(result), "max_page": 1}}

class UncollectedRequest(BaseModel):
    keys: list[str]
    page: int = 1
    limit: int = 60

@app.post("/inventory/uncollected")
def uncollected_lookup(req: UncollectedRequest):
    offset = (req.page - 1) * req.limit

    if not req.keys:
        bson = collection.find(filter={}, projection=projection, sort=[("name", 1)], skip=offset, limit=req.limit)
        total_count = collection.count_documents({})
        result = json.loads(dumps(bson))
        result = transform_items(result)
        return {"result": result, "page_info": {"total_count": total_count, "max_page": -(total_count // -req.limit)}}

    nor_conditions = parse_keys(req.keys)
    if not nor_conditions:
        bson = collection.find(filter={}, projection=projection, sort=[("name", 1)], skip=offset, limit=req.limit)
        total_count = collection.count_documents({})
        result = json.loads(dumps(bson))
        result = transform_items(result)
        return {"result": result, "page_info": {"total_count": total_count, "max_page": -(total_count // -req.limit)}}

    criteria = {"$nor": nor_conditions}
    bson = collection.find(filter=criteria, projection=projection, sort=[("name", 1)], skip=offset, limit=req.limit)
    total_count = collection.count_documents(criteria)
    result = json.loads(dumps(bson))
    result = transform_items(result)

    return {"result": result, "page_info": {"total_count": total_count, "max_page": -(total_count // -req.limit)}}


@app.get("/")
def root(category: str = "", search: str = "", limit: int = 60, page: int = 1, tag: str = '', size:
         str = '', interact: str = '', colors: str = '', surface: str = '',excludeClothing: str='',
         source: str = '', season: str = '', series: str = '', lightingType: str = '', speakerType: str = '', minHeight: int = -1,
         maxHeight: int =-1, body: str = '', pattern: str = '', custom: str = '', sable: str = '',
         concept: str = '', rug: str = '', theme: str = '', style: str = '', type: str = '',
         equippable: str = '', v3Only: str = ''):

    bson, total_count = mongo_query(category, search, limit, page, tag, size, interact, colors,
                                    surface, excludeClothing, source, season, series, lightingType, speakerType, minHeight, maxHeight, body, pattern, custom, sable, concept, rug, theme, style, type, equippable, v3Only)

    return  query_transformation(bson, total_count, limit)
