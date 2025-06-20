import TestApi
import utils


if __name__ == "__main__":
    admin_token = utils.login("admin@wowadmin.com", "secret")
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
