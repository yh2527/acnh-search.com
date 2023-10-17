from pymongo import MongoClient
import requests

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

# api doc:
# https://api.nookipedia.com/doc#/paths/~1nh~1furniture/get
""" CHANGE """
nookCategory = 'items'
#'tools/'
#'interior/'
#"furniture/"

url = 'https://api.nookipedia.com/nh/'
headers = {
    'X-API-KEY': '497e7265-b0a0-448e-b609-a95331766bdf',
    'Accept-Version': '1.0.0'
}
#name = "%3F Block"
#response = (requests.get(url+name, headers = headers)).json()
#print(response)

noMatch = []
for item in collection.find():
    name = item['name']
    if name == "? Block":
        name = "%3F Block"
    # or "height" not in item: take it our for interior
    if "url" not in item:
        print("before getting response:", name)
        response = requests.get(url+nookCategory+name, headers = headers)

        if response.status_code == 200:
            data = response.json()
            nookurl = data["url"]
            #height = data["height"]
            new_fields = {}
            if "url" not in item:
                new_fields["url"] = nookurl
            #if "height" not in item:
            #    new_fields["height"] = height
            if new_fields:
                collection.update_one({'_id': item['_id']}, {'$set': new_fields})
                print(name)
        else:
            print("no match:", name)
            noMatch.append(name)
print(noMatch) 
print(len(noMatch)) 
# 992 after running through furniture api
# 198 after running through interior api
# 53 after running through tools api
