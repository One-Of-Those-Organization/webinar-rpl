import TestApi
import utils

debug = TestApi.TestApi

if __name__ == "__main__":

    admin_token = utils.login("admin@wowadmin.com", "secret")
    
    # NOTE : This only test only the success way, 
    # the failed way is will be progressed later.
    
    # 1. Test adding a webinar with valid payload
    add_webinar_success = debug(
        "protected/event-register",
        method="POST",
        headers={
            "Authorization": f"Bearer {admin_token}",
        },
        payload={
            "desc": "Test Webinar",
            "name": "Test Webinar",
            "dstart": "2025-10-01T10:00:00Z",
            "dend": "2025-10-01T11:00:00Z",
            "link": "https://example.com/webinar",
            "speaker": "Test Speaker",
            "att": "online",
            "img": "https://example.com/image.jpg",
            "max" : 1000,
        },
        desc="Test add webinar with valid payload, should return error_code 0.",
    )
    add_webinar_success.test(0)
    
    # 2. Test editing a webinar with valid payload
    edit_webinar_success = debug(
        "protected/event-edit",
        method="POST",
        headers={
            "Authorization": f"Bearer {admin_token}",
        },
        payload={
            "id": 13,
            "desc": "Updated Test Webinar",
            "name": "Updated Test Webinar",
            "dstart": "2025-10-01T10:00:00Z",
            "dend": "2025-10-01T11:00:00Z",
            "link": "https://example.com/webinar",
            "speaker": "Updated Test Speaker",
            "att": "online",
            "img": "https://example.com/image.jpg",
            "max" : 1000,
            "event_mat_id": 1,
            "cert_template_id": 1,
        },
        desc="Test edit webinar with valid payload, should return error_code 0.",
    )
    edit_webinar_success.test(0)
    
    # 3. Test deleting a webinar with valid payload
    delete_webinar_success = debug(
        "protected/event-del",
        method="POST",
        headers={
            "Authorization": f"Bearer {admin_token}",
        },
        payload={
            "id": 13,  
        },
        desc="Test delete webinar with valid payload, should return error_code 0.",
    )
    delete_webinar_success.test(0)
    
    # 4. Test getting all webinars list
    get_all_webinars_success = debug(
        "protected/event-info-all",
        method="GET",
        headers={
            "Authorization": f"Bearer {admin_token}",
        },
        desc="Test get all webinars, should return error_code 0.",
    )
    get_all_webinars_success.test(0)
    
    # 5. Test getting a webinar by ID, example id 12
    # NOTE: This ID should be replaced with an actual ID from your database.
    get_webinar_by_id_success = debug(
        "protected/event-info-of?id=12",
        method="GET",
        headers={
            "Authorization": f"Bearer {admin_token}",
        },
        desc="Test get webinar by ID, should return error_code 0.",
    )
    get_webinar_by_id_success.test(0)

    # 6. Test post webinar image
    data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAgMBApXWf9wAAAAASUVORK5CYII="
    
    post_webinar_image_success = debug(
        "protected/event-upload-image",
        method="POST",
        headers={
            "Authorization": f"Bearer {admin_token}",
        },
        payload={
            "data": data,
        },
        desc="Test post webinar image, should return error_code 0.",
    )
    post_webinar_image_success.test(0)
    
    # 7. Test getting total webinar count
    get_total_webinar_count_success = debug(
        "protected/event-count",
        method="GET",
        headers={
            "Authorization": f"Bearer {admin_token}",
        },
        desc="Test get total webinar count, should return error_code 0.",
    )
    get_total_webinar_count_success.test(0)
