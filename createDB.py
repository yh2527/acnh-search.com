import pymongo

myclient = pymongo.MongoClient("mongodb://localhost:27017/")

mydb = myclient["acnh"]
print(myclient.list_database_names())
