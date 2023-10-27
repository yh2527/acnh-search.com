import json
from pymongo import MongoClient, InsertOne
import requests

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]

whichCategory = 2 ### CHANGE 0-1-2 to choose fish, insects, or sea creatures ###
collections = ['Fish','Insects','Sea Creatures'];
nookCategory = ['fish/', 'bugs/','sea/']

url = 'https://api.nookipedia.com/nh/'
headers = {
    'X-API-KEY': '497e7265-b0a0-448e-b609-a95331766bdf',
    'Accept-Version': '1.0.0'
}

def fetch_data_from_api(category, name):
    try:
        response = requests.get(url + category + name, headers=headers)
        response.raise_for_status()  # Will raise an error if not a 2xx response
        return response.json()[0].get("url", None) # api returns a list for fish
    except requests.RequestException as e:
        print(f"Error fetching data for {name}: {e}")
        return None

source_collection = db[collections[whichCategory]] # change for Fish or Insects

for record in source_collection.find({}):
    name = record.get("name", "")
    
    if name:
        fetched_url = fetch_data_from_api(nookCategory[whichCategory], name) # change for fish or bugs
        
        if fetched_url:
            # Prepare the record for insertion into the Furniture collection
            record["url"] = fetched_url
            record["category"] = "Fish/Insects"
            print("inserting ", record["name"])
            # Insert the record into Furniture
            db["Furnitures"].insert_one(record)

client.close()
                                    
