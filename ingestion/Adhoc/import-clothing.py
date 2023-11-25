# this script is for importing clothing objects from their own collections into Furnitures
import json
import os
from pymongo import MongoClient, InsertOne
import requests

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]

path = "~/Desktop/acnh-search/source-json/rawdata/data/Clothing/"
path = os.path.expanduser(path)
file_names = [f[:-5] for f in os.listdir(path) if os.path.isfile(os.path.join(path,f)) and f[0]!="."]
#print(file_names)
#['Accessories', 'Tops', 'Shoes', 'Bottoms', 'Socks', 'Umbrellas', 'Bags', 'Clothing Other', 'Dress-Up', 'Headwear']

whichCategory = 9 ### CHANGE from 0 to 9  ###
collections = file_names
nookCategory = 'clothing/'

url = 'https://api.nookipedia.com/nh/'
headers = {
    'X-API-KEY': '497e7265-b0a0-448e-b609-a95331766bdf',
    'Accept-Version': '1.0.0'
}

def fetch_data_from_api(category, name):
    try:
        response = requests.get(url + category + name, headers=headers)
        response.raise_for_status()  # Will raise an error if not a 2xx response
        return response.json().get("url", None) # api returns a list for fish
    except requests.RequestException as e:
        print(f"~~~~~Error fetching data for {name}: {e}")
        return None

source_collection = db[collections[whichCategory]] # change for Fish or Insects

count = 0
for record in source_collection.find({}):
    name = record.get("name", "")

    if name:
        fetched_url = fetch_data_from_api(nookCategory, name)
        #print(name, fetched_url)
        if fetched_url:
            # Prepare the record for insertion into the Furniture collection
            record["url"] = fetched_url
            record["category"] = "Equipments"
            print("inserting ", record["name"])
            count += 1
            # Insert the record into Furniture
            db["Furnitures"].insert_one(record)

print("Total record:",count)

client.close()
