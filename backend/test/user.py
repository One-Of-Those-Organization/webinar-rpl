import TestApi

if __name__ == "__main__":
    test1 = TestApi.TestApi(
        "login",
        payload= { "email": "admin@wowadmin.com", "pass": "secret" },
        method="post",
        desc="Test creating new cert temp"
    )
    test1.test(0)
