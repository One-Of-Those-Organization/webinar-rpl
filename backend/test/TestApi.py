import requests
import json

class TestApi:
    def __init__(self, url="", method="GET", headers=None, payload=None, desc=""):
        self.url = f"http://localhost:3000/api/{url}"
        self.method = method.upper()
        self.headers = headers if headers is not None else {"Content-Type": "application/json"}
        self.payload = payload
        self.desc = desc

    def send_and_test(self, expected_err_code: int) -> bool:
        try:
            print ("=" * 20)
            if self.method == "POST":
                response = requests.post(self.url, json=self.payload, headers=self.headers)
            elif self.method == "GET":
                response = requests.get(self.url, headers=self.headers)
            else:
                print(f"[ERROR] Unsupported HTTP method: {self.method}")
                return False

            print(f"Status : {response.status_code}\nResponse : {response.text}")

            data = response.json()
            return expected_err_code == data.get("error_code", -1)

        except Exception as e:
            print(f"[ERROR] Request failed: {e}")
            return False

    def send(self) -> requests.Response | None:
        try:
            if self.method == "POST":
                response = requests.post(self.url, json=self.payload, headers=self.headers)
            elif self.method == "GET":
                response = requests.get(self.url, headers=self.headers)
            else:
                return None

            data = response.json()
            return data

        except Exception:
            return None

    def test(self, expected_err_code: int):
        status = "PASSED" if self.send_and_test(expected_err_code) else "FAIL"
        print(f"[{status}]: {self.desc}\n")

# bearer_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6MSwiZW1haWwiOiJhZG1pbkB3b3dhZG1pbi5jb20iLCJleHAiOjE3NDk3MTM1NzF9.cIcq2G2VlQMKHAR_7srCCWaMPI5hJ6jZEIVmgNbD_js"

# headers = {
#     "Authorization": f"Bearer {bearer_token}",
#     "Content-Type": "application/json",
# }

# payload = {
#     "id": 7,
#     "cert_temp": "test/index.html"
#     # "code": "YWRtaW5Ad293YWRtaW4uY29tLTctMzc4NzM5NzQyNDIzNTcyNDAxOS00MDg2MzA1NDk1OTYyNDUxNzAz",
# }
