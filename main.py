from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.mongo_query import mongo_query, build_criteria, projection, collection
from backend.query_transformation import query_transformation
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel
from typing import Optional
import json
import re
import pymongo
from bson.json_util import dumps

app = FastAPI()
app.add_middleware(GZipMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

def parse_keys(keys):
    conditions = []
    for key in keys:
        parts = key.split("|", 1)
        if len(parts) == 2:
            conditions.append({"name": {"$regex": f"^{re.escape(parts[0])}$", "$options": "i"}, "sourceSheet": parts[1]})
    return conditions

class InventoryRequest(BaseModel):
    keys: list[str]
    # Optional filter params
    category: str = ''
    excludeClothing: str = ''
    v3Only: str = ''
    search: str = ''
    size: str = ''
    tag: str = ''
    interact: str = ''
    colors: str = ''
    surface: str = ''
    body: str = ''
    equippable: str = ''
    pattern: str = ''
    custom: str = ''
    sable: str = ''
    height: str = ''
    source: str = ''
    season: str = ''
    series: str = ''
    lightingType: str = ''
    speakerType: str = ''
    concept: str = ''
    rug: str = ''
    type: str = ''
    theme: str = ''
    style: str = ''
    minHeight: int = -1
    maxHeight: int = -1

def get_filter_criteria(req):
    """Build filter criteria from request params using shared build_criteria."""
    criteria, collation = build_criteria(
        category=req.category, search=req.search, size=req.size,
        interact=req.interact, colors=req.colors, surface=req.surface,
        excludeClothing=req.excludeClothing, source=req.source, season=req.season,
        series=req.series, lightingType=req.lightingType, speakerType=req.speakerType,
        minHeight=req.minHeight, maxHeight=req.maxHeight, body=req.body,
        pattern=req.pattern, custom=req.custom, sable=req.sable,
        concept=req.concept, rug=req.rug, theme=req.theme, style=req.style,
        type=req.type, equippable=req.equippable, v3Only=req.v3Only, tag=req.tag
    )
    return criteria

@app.post("/inventory")
def inventory_lookup(req: InventoryRequest):
    if not req.keys or len(req.keys) > 5000:
        return {"result": [], "page_info": {"total_count": 0, "max_page": 1}}

    or_conditions = parse_keys(req.keys)
    if not or_conditions:
        return {"result": [], "page_info": {"total_count": 0, "max_page": 1}}

    # Combine inventory keys with any active filters
    filter_criteria = get_filter_criteria(req)
    combined = {"$and": [{"$or": or_conditions}, filter_criteria]}

    bson = collection.find(filter=combined, projection=projection, sort=[("name", pymongo.ASCENDING)])
    result = json.loads(dumps(bson))
    result = transform_items(result)

    return {"result": result, "page_info": {"total_count": len(result), "max_page": 1}}

class UncollectedRequest(InventoryRequest):
    page: int = 1
    limit: int = 60

@app.post("/inventory/uncollected")
def uncollected_lookup(req: UncollectedRequest):
    offset = (req.page - 1) * req.limit
    filter_criteria = get_filter_criteria(req)

    if not req.keys:
        criteria = filter_criteria
    else:
        nor_conditions = parse_keys(req.keys)
        if nor_conditions:
            criteria = {"$and": [filter_criteria, {"$nor": nor_conditions}]}
        else:
            criteria = filter_criteria

    bson = collection.find(filter=criteria, projection=projection, sort=[("name", pymongo.ASCENDING)], skip=offset, limit=req.limit)
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
