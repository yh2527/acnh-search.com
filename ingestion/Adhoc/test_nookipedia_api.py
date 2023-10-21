import json
import requests

url = 'https://api.nookipedia.com/nh/'
headers = {
    'X-API-KEY': '497e7265-b0a0-448e-b609-a95331766bdf',
    'Accept-Version': '1.0.0'
}

#name = 'zebra turkeyfish'
name = 'Atlas moth'
category = 'bugs/' #'fish/'
try:
    response = requests.get(url + category + name, headers=headers) 
    response.raise_for_status()  # Will raise an error if not a 2xx response
    print(response.json()[0].get("url", None))
except requests.RequestException as e:
    print(f"Error fetching data for {name}: {e}")
