"""
Add v3.0.0 items to the unified Furnitures collection.

Queries each individual collection for versionAdded == "3.0.0",
adds a `category` field using the same logic as union_collections.py,
and inserts the results into the Furnitures collection.

Run this AFTER import_v3_from_gsheet.py.

Usage:
    python add_v3_to_furnitures.py
"""

from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["acnh-furnitures"]

# Same collection list as union_collections.py
COLLECTIONS = [
    "Housewares",
    "Miscellaneous",
    "Wall-mounted",
    "Wallpaper",
    "Floors",
    "Rugs",
    "Fencing",
    "Tools-Goods",
    "Ceiling Decor",
    "Interior Structures",
]

# Build fish/insect model detection lists (same as union_collections.py)
fish_bugs = db.Fish.distinct("name") + db.Insects.distinct("name")
model_exceptions = [
    "grand Atlas moth model",
    "M. sunset moth model",
    "grand Q. A. birdwing model",
    "R. Brooke's birdwing model",
    "grand b. dragonfly model",
    "citrus long-horned b. model",
    "earth-boring dung b. model",
    "grand giraffe stag model",
    "grand goliath beetle model",
    "grand h. hercules model",
]


def get_category(item, collection_name):
    """Determine the category for an item, matching union_collections.py logic."""
    name = item.get("name", "")

    # Cooking check (recipe.category in Savory/Sweet)
    recipe = item.get("recipe")
    if recipe and isinstance(recipe, dict) and recipe.get("category") in ("Savory", "Sweet"):
        return "Cooking"

    # Fish/insect model check (name minus last 6 chars " model" in fish_bugs list)
    if len(name) > 6 and name[:-6] in fish_bugs:
        return "Models"

    # Exception list check
    if name in model_exceptions:
        return "Models"

    return collection_name


total = 0
for coll_name in COLLECTIONS:
    items = list(db[coll_name].find({"versionAdded": "3.0.0"}))
    if not items:
        print(f"  {coll_name}: 0 items")
        continue

    for item in items:
        item["category"] = get_category(item, coll_name)
        # Remove the _id from the source collection so Furnitures gets a new one
        del item["_id"]

    db["Furnitures"].insert_many(items)
    print(f"  {coll_name}: {len(items)} items → Furnitures")
    total += len(items)

print(f"\n=== Total inserted into Furnitures: {total} ===")
client.close()
