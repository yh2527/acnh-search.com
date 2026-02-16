"""
Enrich v3.0.0 items in the Furnitures collection.

Combines the logic from image_info.py and variations_info.py,
scoped to only items where versionAdded == "3.0.0".

1. image_info  — ensure every item has an `image` field
                  (fallback: furnitureImage → storageImage → first variation image)
2. variations_info — build the nested variations_info structure
                     for items with a `variations` array

Run this AFTER add_v3_to_furnitures.py.

Usage:
    python enrich_v3.py
"""

from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]
collection = db["Furnitures"]

V3_FILTER = {"versionAdded": "3.0.0"}

# ---------------------------------------------------------------------------
# Step 1: image_info — fill missing `image` fields
# ---------------------------------------------------------------------------

print("=== Step 1: image_info ===")
image_count = 0
for item in collection.find(V3_FILTER):
    if item.get("image"):
        continue

    item_image = None
    if item.get("furnitureImage"):
        item_image = item["furnitureImage"]
    elif item.get("storageImage"):
        item_image = item["storageImage"]
    elif item.get("variations") and isinstance(item["variations"], list) and len(item["variations"]) > 0:
        v0 = item["variations"][0]
        if v0.get("image"):
            item_image = v0["image"]
        elif v0.get("storageImage"):
            item_image = v0["storageImage"]

    if item_image:
        collection.update_one({"_id": item["_id"]}, {"$set": {"image": item_image}})
        image_count += 1
        print(f"  image set: {item['name']}")

print(f"  {image_count} items updated with image\n")

# ---------------------------------------------------------------------------
# Step 2: variations_info — build nested variation structure
# ---------------------------------------------------------------------------

print("=== Step 2: variations_info ===")
var_count = 0
for item in collection.find({**V3_FILTER, "variations": {"$exists": True}}):
    variations = item.get("variations")
    if not variations or not isinstance(variations, list):
        continue

    variations_info = {}
    for v in variations:
        variation_key = "null" if v.get("variation") is None else str(v["variation"])
        if variation_key not in variations_info:
            variations_info[variation_key] = {}

        # Use storageImage for Equipments, image otherwise
        if item.get("category") == "Equipments":
            v_image = v.get("storageImage")
        else:
            v_image = v.get("image")

        pattern_key = "null" if v.get("pattern") is None else str(v["pattern"])

        entry = {
            "image": v_image,
            "colors": list(set(filter(None, v.get("colors", [])))),
        }
        # Strip None values
        entry = {k: val for k, val in entry.items() if val is not None}

        variations_info[variation_key][pattern_key] = entry

    collection.update_one({"_id": item["_id"]}, {"$set": {"variations_info": variations_info}})
    var_count += 1
    print(f"  variations_info set: {item['name']}")

print(f"  {var_count} items updated with variations_info\n")

print("=== Enrichment complete ===")
client.close()
