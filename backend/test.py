import requests
import json

class TestApi:
    def __init__(self, url="", method="GET", headers=None, payload=None, desc=""):
        self.url = f"http://localhost:3000/api/{url}"
        self.method = method.upper()
        self.headers = headers if headers is not None else {"Content-Type": "application/json"}
        self.payload = payload
        self.desc = desc

    def send(self, expected_err_code: int) -> bool:
        try:
            if self.method == "POST":
                response = requests.post(self.url, json=self.payload, headers=self.headers)
            elif self.method == "GET":
                response = requests.get(self.url, headers=self.headers)
            else:
                print(f"  [ERROR] Unsupported HTTP method: {self.method}")
                return False

            # print(f"Status : {response.status_code}\nResponse : {response.text}")

            data = response.json()
            return expected_err_code == data.get("error_code", -1)

        except Exception as e:
            print(f"  [ERROR] Request failed: {e}")
            return False

    def test(self, expected_err_code: int):
        status = "PASSED" if self.send(expected_err_code) else "FAIL"
        print(f"[{status}]: {self.desc}")

if __name__ == "__main__":
    test1 = TestApi(
        "gen-otp-for-register?email=fernandoperry1234@gmail.com",
        method="GET",
        desc="Test the gen OTP. If given a valid email, it should return error_code 0."
    )
    test1.test(0)

    test2 = TestApi(
        "gen-otp-for-register?email=kuuun",
        method="GET",
        desc="Test the gen OTP with invalid email, it should return error_code 1."
    )
    test2.test(1)

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
