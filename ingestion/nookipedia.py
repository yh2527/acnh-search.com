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
#name = "bamboo lattice fence"
#response = (requests.get(url+nookCategory, headers = headers)).json()
#print(len(response))
#print(response)
'''
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
'''
# 992 after running through furniture api
# 198 after running through interior api
# 53 after running through tools api

no_match = ['birthday cupcake', 'Bunny Day fence', 'bamboo lattice fence', 'bamboo-slats fence', 'barbed-wire fence', 'block fence', 'brick fence', 'corral fence', 'corrugated iron fence', 'country fence', 'frozen fence', 'green bamboo fence', 'hedge', 'imperial fence', 'iron fence', 'iron-and-stone fence', 'large lattice fence', 'lattice fence', 'log fence', 'log-wall fence', 'mermaid fence', 'park fence', 'rope fence', 'simple wooden fence', 'spiky fence', 'spooky fence', 'stone fence', 'straw fence', 'vertical-board fence', 'wedding fence', 'zen fence', 'brick pillar', 'concrete pillar', 'golden pillar', 'low brick island counter', 'low concrete island counter', 'low golden island counter', 'low marble island counter', 'low simple island counter', 'low steel island counter', 'low wooden island counter', 'marble pillar', 'partition wall', 'simple pillar', 'steel pillar', 'tall brick island counter', 'tall concrete island counter', 'tall golden island counter', 'tall marble island counter', 'tall simple island counter', 'tall steel island counter', 'tall wooden island counter', 'wooden pillar']

found_match = []
response = (requests.get("https://api.nookipedia.com/nh/items", headers = headers)).json()
for r in response:
    if r["name"] in no_match:
        found_match.append(r["name"])
        item = collection.find(filter = {'name':r["name"]})
        for i in item:
            print(i["name"])
            collection.update_one({'_id':i['_id']},{'$set': {"url":r["url"]}})
print(found_match)
print(len(found_match))# 53
