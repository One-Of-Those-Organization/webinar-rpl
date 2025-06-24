import TestApi as t

def login(email: str, password: str) -> str:
    login = t.TestApi(
            "login",
            method="post",
            payload={
                "email": email,
                "pass": password
                }
            )
    response = login.send()
    if response:
        return response.get("token")
    return ""
