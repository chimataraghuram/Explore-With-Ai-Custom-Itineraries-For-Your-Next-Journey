import urllib.request
import json

url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=AIzaSyD4zUodxal4lPfpELIr6GrVfCq3p5EJtvs"
req = urllib.request.Request(url, method="POST")
req.add_header('Content-Type', 'application/json')
data = json.dumps({"contents":[{"parts":[{"text":"Hi"}]}]}).encode('utf-8')

try:
    with urllib.request.urlopen(req, data=data) as response:
        print(response.read().decode())
except Exception as e:
    print(e)
    if hasattr(e, 'read'):
        print(e.read().decode())
