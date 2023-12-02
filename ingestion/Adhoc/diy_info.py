from pymongo import MongoClient, InsertOne

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

diy = list(collection.find({"$or":[{"recipe": {"$exists":True, "$ne": None}},{"category":"Interior Structures"}]}))
#diy = list(collection.find({"recipe": None}))
#222 don't have recipe field: critters and interior structures
#4313 have recipe field
#3423 have recipe field with null value
#891 have recipe filed that's not null

print(len(diy)) #913 = 891 crafting/cooking + 22 interior stuctures
print(type(diy[0]))
print(diy[0])


count = 0
for item in diy:
    print(item["name"])
    if item["category"] == "Interior Structures":
        item_materials = db["Recipes"].find_one(filter={'name':{'$regex': item['name'], '$options': 'i'}},projection=
                                                    {'materials':1,'source':1,"_id":0})
        #print('materials', item_materials)
    else:
        item_materials = item['recipe']
    diy_info = {'source':item_materials['source'],'materials':{}}

    for m in list(item_materials['materials'].keys()):
        if m not in diy_info['materials']:
            diy_info['materials'][m] = {}
        diy_info['materials'][m]['amount'] = item_materials['materials'][m]
        if "Bell" in m:
            find_material = "Bell bag"
        elif "turnips" in m:
            find_material = "turnips"
        else:
            find_material = m
        icon = db["Other"].find_one(filter={'name':find_material},projection=
                                    {'inventoryImage':1,'translations':1,"_id":0})
        if icon:
            diy_info['materials'][m].update(icon)
        else:
            more_icons = collection.find_one(filter={'name':find_material},projection=
                                             {'image':1,'iconImage':1,'variations':1,'translations':1,"_id":0})
            if more_icons:
                if "variations" in more_icons:
                    icon = more_icons['variations'][0]['image']
                else:
                    icon = more_icons.get('image',more_icons.get('iconImage',None))
                diy_info['materials'][m].update({'inventoryImage':icon,
                                            'translations':more_icons.get('translations',None)})
    #print(diy_info)
    collection.update_one({'_id': item['_id']}, {'$set': {'diy_info': diy_info}})
    count += 1
print(f"{count} records updated") #2246 records updated
client.close()

