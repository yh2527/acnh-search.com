import json
from pymongo import MongoClient, InsertOne

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]
sable = [    "Baby bear",    "baby bed",    "baby chair",    "beach chairs with parasol",    "beach towel",    "bistro table",    "bottled beverage",    "bunk bed",    "changing room",    "clothesline",    "clothesline pole",    "corkboard",    "corner clothing rack",    "cube light",    "curtain partition",    "cushion",    "cutting board",    "decorative plate",    "desktop computer",    "dessert carrier",    "digital scale",    "diner neon clock",    "director's chair",    "DJ's turntable",    "donut stool",    "drapery",    "dress mannequin",    "elegant bed",    "elegant chair",    "elegant console table",    "elegant dresser",    "elegant lamp",    "elegant sofa",    "fancy frame",    "festival lantern",    "festival-lantern set",    "floor lamp",    "floor seat",    "framed photo",    "framed poster",    "futon",    "giant teddy bear",    "pile of zen cushions",    "plastic clothing organizer",    "poolside bed",    "popcorn snack set",    "poster stand",    "ranch bed",    "ranch lowboard",    "ranch tea table",    "retro gas pump",    "retro transportation stop",    "safety barrier",    "shaded pendant lamp",    "short simple panel",    "simple bed",    "simple chair",    "simple panel",    "simple small dresser",    "simple sofa",    "simple stool",    "simple table",    "skateboard",    "sloppy bed",    "sloppy sofa",    "sloppy table",    "small covered round table",    "small LED display",    "small mannequin",    "spaceship control panel",    "spray can",    "stack of clothes",    "stacked bags",    "stall",    "standard umbrella stand",    "standing electric sign",    "standing shop sign",    "strategic meeting table",    "street lamp with banners",    "study carrel",    "study chair",    "sturdy paper bag",    "table lamp",    "table setting",    "hammock",    "hanging cube light",    "hanging sign",    "high chair",    "horizontal organizer",    "horizontal split curtains",    "iron hanger stand",    "ironing board",    "ironing set",    "ironwood bed",    "kimono stand",    "kotatsu",    "laptop",    "large covered round table",    "light-bulb sign",    "loft bed with desk",    "log bed",    "log chair",    "log decorative shelves",    "log dining table",    "log extra-long sofa",    "log garden lounge",    "log round table",    "loom",    "low screen",    "makeup pouch",    "Mama bear",    "merchandise table",    "mug",    "Nordic chair",    "Nordic low table",    "Nordic lowboard",    "Nordic shelves",    "Nordic sofa",    "Nordic table",    "open wooden shelves",    "outdoor bench",    "outdoor folding chair",    "outdoor table",    "Papa bear",    "paper lantern",    "pet bed",    "table with cloth",    "tablet device",    "tea set",    "transit seat",    "unfinished puzzle",    "upright organizer",    "utility wagon",    "vehicle cabin seat",    "vertical banner",    "vertical split curtains",    "vintage TV tray",    "wall-mounted LED display",    "wheelchair",    "wide display stand",    "wooden box",    "wooden double bed",    "wooden field sign",    "wooden mini table",    "wooden music box",    "wooden simple bed",    "wooden stool",    "wooden table",    "yoga mat",    "zen bench",    "zen cushion"]


custom = ["autograph cards", "backlit sign", "bath bucket", "bathroom stall", "blue corner", "bottle crate", "bulletin board", "cartoonist's set", "castle tower", "castle wall", "clipboard", "copy machine", "decorative bottles", "dispenser", "document stack", "donation box", "drink machine", "drum set", "effects rack", "electric guitar", "examination-room desk", "fax machine", "fence", "fish container", "fresh-food trays", "game-show stand", "glass jar", "glow-in-the-dark stickers", "hanging guide sign", "hanging monitor", "hanging scroll", "inspection equipment", "magazine", "magazine rack", "milk can", "minicar", "neutral corner", "painting set", "plain wooden shop sign", "plastic bench", "professional headphones", "reception counter","record box", "red corner", "refrigerator", "rock guitar", "scattered papers", "scooter", "shopping cart", "snack", "stacked bottle crates", "stacked fish containers", "stacked magazines", "steel trash can", "storage shed", "storefront", "tabletop POP display", "tank", "tokonoma", "toothbrush-and-cup set", "torii", "truck", "unfolded reference sheet", "upright locker", "wedding welcome board", "yacht"]

for e in custom:
    if collection.find_one(filter = {"name":e}):
        #print(e)
        collection.update_one({'name': e}, {'$set': {'customPattern': True}})
    else:
        print("~~not found~~:", e)
'''
for e in sable:
    if collection.find_one(filter = {"name":e}):
        #print(e)
        collection.update_one({'name': e}, {'$set': {'sablePattern': True, 'customPattern': True}})
    else:
        print("~~not found~~:", e)
'''

