#python3 -m speed_test.backend_steps
import time
from backend.mongo_query import mongo_query
from backend.query_transformation import query_transformation

num_requests = 30

category = "Housewares"
search = ""
limit = 40
page = 1
tag = ""
size = ""
interact = ""
colors = "Black"
surface = ""
source = "Crafting"
season = ""
series = ""
lightingType = ""
speakerType = ""
minHeight = -1
maxHeight = 20
body = ""
pattern = ""
custom = ""
sable = ""
concept = ""
rug = ""
theme = ""
style = ""
type = ""
equippable = ""

total_time = query_time = transform_time = 0

for i in range(num_requests):
    
    start_time = time.time()

    bson, total_count = mongo_query(category, search, limit, page, tag, size, interact, colors, surface, source, season, series, lightingType, speakerType, minHeight, maxHeight, body, pattern, custom, sable, concept, rug, theme, style, type, equippable)
    
    query_end_time = time.time()
    query_time += query_end_time - start_time
    print(f"Mongo query {i+1} took {round(query_end_time - start_time,2)} seconds.")
    
    result = query_transformation(bson, total_count, limit)
    
    end_time = time.time()
    transform_time += end_time - query_end_time
    print(f"Transformation {i+1} took {round(end_time - query_end_time,2)} seconds.")
    
    total_time += end_time - start_time
    print(f"Both steps {i+1} took {round(end_time - start_time,2)} seconds.")

average_query_time = round(query_time / num_requests, 2)
average_transform_time = round(transform_time / num_requests, 2)
average_total_time = round(total_time / num_requests, 2)
print(f"Average response time: query {average_query_time}, transformation {average_transform_time}, total: {average_total_time} in seconds.")


