import TestApi

admin_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6MSwiZW1haWwiOiJhZG1pbkB3b3dhZG1pbi5jb20iLCJleHAiOjE3NTA1NjkyNTl9.jkTxe0_Tz1-4SJpdl49-dseAJorWGM_N7DyevA8kSV0"

if __name__ == "__main__":
    test1 = TestApi.TestApi(
        "protected/create-new-cert-from-event",
        headers={ "Authorization": f"Bearer {admin_token}", "Content-Type": "application/json" },
        payload= { "event_id": 7 },
        method="post",
        desc="Test creating new cert temp"
    )
    test1.test(0)

    test2 = TestApi.TestApi(
        "protected/cert-editor?cert_id=13",
        headers={ "Authorization": f"Bearer {admin_token}", "Content-Type": "application/json" },
        method="get",
        desc="Test accessing the editor."
    )
    test2.test(0)
