import requests
import time

num_requests = 30
#url = 'https://acnh-search.com' #avg reponse time 0.7 seconds
url = 'http://localhost:4000/'  #avg reponse time 0.2 seconds

def make_request_and_measure(url, params):
    start_time = time.time()
    response = requests.get(url, params=params)
    end_time = time.time()
    return end_time - start_time

params = {
    "category": "Wallpaper", 
    "search": "cherry", 
    "limit": 40, 
    "page": 1, 
    "tag": "", 
    "size": "", 
    "interact": "", 
    "colors": "", 
    "surface": "", 
    "source": "", 
    "season": "", 
    "series": "", 
    "lightingType": "", 
    "speakerType": "", 
    "minHeight": -1, 
    "maxHeight": -1, 
    "body": "", 
    "pattern": "", 
    "custom": "", 
    "sable": "", 
    "concept": "", 
    "rug": "", 
    "theme": "", 
    "style": "", 
    "type": "", 
    "equippable": ""
}


total_time = 0
for i in range(num_requests):
    response_time = make_request_and_measure(url, params)
    total_time += response_time
    print(f"Request {i+1} took {round(response_time,2)} seconds.")

average_time = round(total_time / num_requests, 2)
print(f"Average response time: {average_time} seconds.")

''' list of parameters:
(category: str = "", search: str = "", limit: int = 40, page: int = 1, tag: str = '', size:
         str = '', interact: str = '', colors: str = '', surface: str = '', height: str = '',
         source: str = '', season: str = '', series: str = '', lightingType: str = '', speakerType: str = '', minHeight: int = -1,
         maxHeight: int =-1, body: str = '', pattern: str = '', custom: str = '', sable: str = '',
         concept: str = '', rug: str = '', theme: str = '', style: str = '', type: str = '',
         equippable: str = '')
'''
