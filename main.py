from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.mongo_query import mongo_query
from backend.query_transformation import query_transformation
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel
import json
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

class InventoryRequest(BaseModel):
    keys: list[str]

@app.post("/inventory")
def inventory_lookup(req: InventoryRequest):
    if not req.keys or len(req.keys) > 5000:
        return {"result": [], "page_info": {"total_count": 0, "max_page": 1}}

    or_conditions = []
    for key in req.keys:
        parts = key.split("|", 1)
        if len(parts) == 2:
            or_conditions.append({"name": {"$regex": f"^{parts[0]}$", "$options": "i"}, "sourceSheet": parts[1]})

    if not or_conditions:
        return {"result": [], "page_info": {"total_count": 0, "max_page": 1}}

    projection = {
        "name": 1, "category": 1, "image": 1, "furnitureImage": 1, "buy": 1,
        "variations_info": 1, "diy_info": 1, "seasonEvent": 1, "exchangePrice": 1, "exchangeCurrency": 1,
        "size": 1, "tag": 1, "source": 1, "colors": 1, "interact": 1, "height": 1,
        "url": 1, "series": 1, "surface": 1, "kitCost": 1, "kitType": 1, "patternCustomize": 1,
        "translations.cNzh": 1, "bodyCustomize": 1, "customPattern": 1, "sablePattern": 1,
        "concepts": 1, "lightingType": 1, "villagerEquippable": 1, "cyrusCustomizePrice": 1,
        "speakerType": 1, "storageImage": 1, "themes": 1, "styles": 1, "sourceSheet": 1, "_id": 0
    }

    bson = collection.find(filter={"$or": or_conditions}, projection=projection, sort=[("name", 1)])
    result = json.loads(dumps(bson))

    for item in result:
        item["name"] = item["name"].capitalize()
        item["colors"] = list(set(filter(lambda x: x is not None, item.get("colors", []))))
        if "themes" in item:
            item["themes"] = list(set(filter(lambda x: x is not None, item.get("themes", []))))
        if "styles" in item:
            item["styles"] = list(set(filter(lambda x: x is not None, item.get("styles", []))))
        if "height" in item:
            item["height"] = round(item["height"], 1)

    return {"result": result, "page_info": {"total_count": len(result), "max_page": 1}}


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
'''
@app.get("/macode")
def another_page(color: str = '', limit: int = 40):
    #criteria = {"colors":color}
    criteria = {}
    bson = db["MACode"].find(filter = criteria)
    total_count = db["MACode"].count_documents(criteria)
    result = json.loads(dumps(bson))
    return {"result":result,
            "page_info":{"total_count":total_count,"max_page":-(total_count//-limit)}}
'''
