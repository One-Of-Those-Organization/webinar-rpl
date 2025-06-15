import requests

# url = "http://localhost:3000/api/protected/event-participate-register"
# url = "http://localhost:3000/api/protected/event-participate-of-event-count?id=7"
url = "http://localhost:3000/api/protected/cert-register"
method = "POST"
bearer_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6MSwiZW1haWwiOiJhZG1pbkB3b3dhZG1pbi5jb20iLCJleHAiOjE3NDk3MTM1NzF9.cIcq2G2VlQMKHAR_7srCCWaMPI5hJ6jZEIVmgNbD_js"

headers = {
    "Authorization": f"Bearer {bearer_token}",
    "Content-Type": "application/json",  # Adjust based on your API needs
}

payload = {
    "id": 7,
    "cert_temp": "test/index.html"
    # "code": "YWRtaW5Ad293YWRtaW4uY29tLTctMzc4NzM5NzQyNDIzNTcyNDAxOS00MDg2MzA1NDk1OTYyNDUxNzAz",
}

if method.upper() == "POST":
    response = requests.post(url, json=payload, headers=headers)
else:
    response = requests.get(url, headers=headers)

print("Status Code:", response.status_code)
print("Response Body:", response.text)
