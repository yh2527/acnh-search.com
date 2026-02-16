"""
Import v3.0.0 items from the ACNH Google Spreadsheet into MongoDB.

Downloads each sheet as CSV, filters for Version Added == 3.0.0,
groups rows by item name (multiple rows = variations), maps columns
to the project's JSON format, and inserts into individual MongoDB collections.

Usage:
    python import_v3_from_gsheet.py
"""

import pandas as pd
import requests
from io import StringIO
from urllib.parse import quote
from pymongo import MongoClient

SPREADSHEET_ID = "13d_LAJPlxMa_DubPTuirkIV4DERBMXbrWQsmSh8ReK4"

# Google Sheet tab name → MongoDB collection name
SHEETS = {
    "Housewares": "Housewares",
    "Miscellaneous": "Miscellaneous",
    "Wall-mounted": "Wall-mounted",
    "Wallpaper": "Wallpaper",
    "Floors": "Floors",
    "Rugs": "Rugs",
    "Fencing": "Fencing",
    "Tools/Goods": "Tools-Goods",
    "Ceiling Decor": "Ceiling Decor",
    "Interior Structures": "Interior Structures",
}

# Fields that belong in the variations array (not at the base level)
# when an item has multiple rows
VARIATION_FIELDS = {
    "image", "variation", "pattern", "patternTitle",
    "kitType", "cyrusCustomizePrice", "surface",
    "exchangePrice", "exchangeCurrency",
    "seasonEvent", "seasonEventExclusive", "hhaCategory",
    "filename", "variantId", "internalId", "uniqueEntryId",
    "colors", "concepts",
}

# ---------------------------------------------------------------------------
# Transform helpers
# ---------------------------------------------------------------------------

def null_if_empty(x):
    if pd.isna(x) or str(x).strip() == "":
        return None
    return str(x).strip()


def yes_to_bool(x):
    if pd.isna(x):
        return False
    return str(x).strip().lower() == "yes"


def to_int_or_null(x):
    if pd.isna(x) or str(x).strip() == "":
        return None
    try:
        return int(float(str(x).strip()))
    except (ValueError, TypeError):
        return None


def to_buy_price(x):
    """Convert buy price: NFS/NA → -1, otherwise int."""
    if pd.isna(x) or str(x).strip() == "":
        return -1
    s = str(x).strip()
    if s.upper() in ("NFS", "NA", "N/A"):
        return -1
    try:
        return int(float(s))
    except (ValueError, TypeError):
        return -1


def to_source_array(x):
    if pd.isna(x) or str(x).strip() == "":
        return []
    return [str(x).strip()]


# ---------------------------------------------------------------------------
# Column mapping: CSV column name → (JSON field name, transform)
#
# Each sheet has a different subset of columns; the code only uses columns
# that actually exist in the downloaded CSV.
# ---------------------------------------------------------------------------

COLUMN_MAP = {
    # Common fields
    "Name":                     ("name",                  lambda x: str(x).strip().lower() if pd.notna(x) else None),
    "Image":                    ("image",                 lambda x: str(x).strip() if pd.notna(x) and str(x).strip() else None),
    "Variation":                ("variation",             null_if_empty),
    "Body Title":               ("bodyTitle",             null_if_empty),
    "Pattern":                  ("pattern",               null_if_empty),
    "Pattern Title":            ("patternTitle",          null_if_empty),
    "DIY":                      ("diy",                   yes_to_bool),
    "Body Customize":           ("bodyCustomize",         yes_to_bool),
    "Customize":                ("bodyCustomize",         yes_to_bool),   # Fencing / Tools-Goods variant
    "Pattern Customize":        ("patternCustomize",      yes_to_bool),
    "Kit Cost":                 ("kitCost",               to_int_or_null),
    "Kit Type":                 ("kitType",               null_if_empty),
    "Cyrus Customize Price":    ("cyrusCustomizePrice",   to_int_or_null),
    "Buy":                      ("buy",                   to_buy_price),
    "Sell":                     ("sell",                  to_int_or_null),
    "Size":                     ("size",                  null_if_empty),
    "Surface":                  ("surface",               yes_to_bool),
    "Exchange Price":           ("exchangePrice",         to_int_or_null),
    "Exchange Currency":        ("exchangeCurrency",      null_if_empty),
    "Source":                   ("source",                to_source_array),
    "Source Notes":             ("sourceNotes",           null_if_empty),
    "Season/Event":             ("seasonEvent",           null_if_empty),
    "Season/Event Exclusive":   ("seasonEventExclusive",  yes_to_bool),
    "HHA Base Points":          ("hhaBasePoints",         to_int_or_null),
    "HHA Category":             ("hhaCategory",           null_if_empty),
    "Interact":                 ("interact",              yes_to_bool),
    "Tag":                      ("tag",                   null_if_empty),
    "Outdoor":                  ("outdoor",               yes_to_bool),
    "Speaker Type":             ("speakerType",           null_if_empty),
    "Lighting Type":            ("lightingType",          null_if_empty),
    "Catalog":                  ("catalog",               null_if_empty),
    "Version Added":            ("versionAdded",          lambda x: str(x).strip() if pd.notna(x) else None),
    "Unlocked?":                ("unlocked",              yes_to_bool),
    "Filename":                 ("filename",              null_if_empty),
    "Variant ID":               ("variantId",             null_if_empty),
    "Internal ID":              ("internalId",            to_int_or_null),
    "Unique Entry ID":          ("uniqueEntryId",         null_if_empty),
    "HHA Series":               ("series",                null_if_empty),
    "HHA Set":                  ("set",                   null_if_empty),
    "Set":                      ("set",                   null_if_empty),  # Tools/Goods variant
    # Wallpaper-specific
    "VFX":                      ("vfx",                   null_if_empty),
    "VFX Type":                 ("vfxType",               null_if_empty),
    "Window Type":              ("windowType",            null_if_empty),
    "Window Color":             ("windowColor",           null_if_empty),
    "Pane Type":                ("paneType",              null_if_empty),
    "Curtain Type":             ("curtainType",           null_if_empty),
    "Curtain Color":            ("curtainColor",          null_if_empty),
    "Ceiling Type":             ("ceilingType",           null_if_empty),
}

# ---------------------------------------------------------------------------
# Combined-column helpers (not 1:1 with a single CSV column)
# ---------------------------------------------------------------------------

def build_colors(row):
    colors = []
    for col in ("Color 1", "Color 2"):
        if col in row.index and pd.notna(row[col]) and str(row[col]).strip():
            colors.append(str(row[col]).strip())
    return colors if colors else None


def build_concepts(row):
    concepts = []
    for col in ("HHA Concept 1", "HHA Concept 2"):
        if col in row.index and pd.notna(row[col]) and str(row[col]).strip():
            concepts.append(str(row[col]).strip().lower())
    return concepts if concepts else None


# ---------------------------------------------------------------------------
# Row → document conversion
# ---------------------------------------------------------------------------

def row_to_dict(row, available_columns):
    """Convert a single CSV row into a flat dict using available column mappings."""
    doc = {}
    for csv_col, (json_field, transform) in COLUMN_MAP.items():
        if csv_col in available_columns:
            doc[json_field] = transform(row[csv_col])
    # Combined fields
    doc["colors"] = build_colors(row)
    doc["concepts"] = build_concepts(row)
    return doc


# ---------------------------------------------------------------------------
# Sheet download & processing
# ---------------------------------------------------------------------------

def download_sheet(sheet_name):
    """Download a Google Sheets tab as a pandas DataFrame via the gviz CSV endpoint."""
    url = (
        f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}"
        f"/gviz/tq?tqx=out:csv&sheet={quote(sheet_name)}"
    )
    resp = requests.get(url)
    resp.raise_for_status()
    return pd.read_csv(StringIO(resp.text))


def process_sheet(sheet_name, collection_name):
    """Download a sheet, filter for v3.0.0, group by name, and return documents."""
    print(f"\n--- {sheet_name} → {collection_name} ---")

    df = download_sheet(sheet_name)
    print(f"  Total rows in sheet: {len(df)}")

    if "Version Added" not in df.columns:
        print("  WARNING: no 'Version Added' column — skipping")
        return []

    # Normalise version strings (might come as "3.0" if the sheet stores a number)
    df["Version Added"] = df["Version Added"].astype(str).str.strip()
    v3 = df[df["Version Added"].isin(["3.0.0", "3.0"])]
    print(f"  v3.0.0 rows: {len(v3)}")

    if v3.empty:
        return []

    available_columns = set(v3.columns)
    documents = []

    for name, group in v3.groupby("Name", sort=False):
        rows = list(group.iterrows())

        if len(rows) == 1:
            # Single row → flat document (no variations array)
            _, row = rows[0]
            doc = row_to_dict(row, available_columns)
            doc["sourceSheet"] = sheet_name
            # Normalise version to 3.0.0
            doc["versionAdded"] = "3.0.0"
        else:
            # Multiple rows → base fields + variations array
            _, first_row = rows[0]
            all_fields = row_to_dict(first_row, available_columns)

            # Base document: everything except variation-specific fields
            doc = {k: v for k, v in all_fields.items() if k not in VARIATION_FIELDS}
            doc["sourceSheet"] = sheet_name
            doc["versionAdded"] = "3.0.0"

            # Build variations array from every row
            variations = []
            for _, row in rows:
                v_all = row_to_dict(row, available_columns)
                variation = {k: v_all[k] for k in VARIATION_FIELDS if k in v_all}
                variations.append(variation)

            doc["variations"] = variations

        documents.append(doc)

    print(f"  Items (after grouping): {len(documents)}")
    return documents


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    client = MongoClient("mongodb://localhost:27017/")
    db = client["acnh-furnitures"]

    total = 0
    for sheet_name, collection_name in SHEETS.items():
        docs = process_sheet(sheet_name, collection_name)
        if docs:
            result = db[collection_name].insert_many(docs)
            inserted = len(result.inserted_ids)
            print(f"  ✓ Inserted {inserted} items into '{collection_name}'")
            total += inserted
        else:
            print(f"  (no v3.0.0 items)")

    print(f"\n=== Total items inserted across all collections: {total} ===")
    client.close()


if __name__ == "__main__":
    main()
