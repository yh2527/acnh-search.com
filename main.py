import json
from bson.json_util import dumps
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.mongo_query import mongo_query
from backend.query_transformation import query_transformation
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI()
app.add_middleware(GZipMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root(category: str = "", search: str = "", limit: int = 40, page: int = 1, tag: str = '', size:
         str = '', interact: str = '', colors: str = '', surface: str = '',excludeClothing: str='',
         source: str = '', season: str = '', series: str = '', lightingType: str = '', speakerType: str = '', minHeight: int = -1,
         maxHeight: int =-1, body: str = '', pattern: str = '', custom: str = '', sable: str = '',
         concept: str = '', rug: str = '', theme: str = '', style: str = '', type: str = '',
         equippable: str = ''):
    
    bson, total_count = mongo_query(category, search, limit, page, tag, size, interact, colors,
                                    surface, excludeClothing, source, season, series, lightingType, speakerType, minHeight, maxHeight, body, pattern, custom, sable, concept, rug, theme, style, type, equippable)
    
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
