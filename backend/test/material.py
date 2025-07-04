import TestApi
import utils

debug = TestApi.TestApi

if __name__ == "__main__":
    
    admin_token = utils.login("admin@wowadmin.com", "secret")
    
    # NOTE : This only test only the success way,
    # the failed way is will be progressed later.
    
    # 1. Test add material to a webinar with valid payload
    add_material_success = debug(
        "protected/material-register",
        method="POST",
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
        payload={
            "id": 6,  # Make sure this id webinar is exists
            "event_attach": "https://example.com/material.pdf",  # URL of the material to be added
        },
        desc="Test add material to webinar with valid payload, should return error_code 0.",
    )
    add_material_success.test(0)
    
    # 2. Test get material data from a webinar
    get_material_data_success = debug(
        "protected/material-info-of?event_id=6",
        method="GET",
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
        desc="Test get material data from a webinar, should return error_code 0.",
    )
    get_material_data_success.test(0)
    
    # 3. Test delete a material from a webinar
    delete_material_success = debug(
        "protected/material-del",
        method="POST",
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
        payload={
            "id": 6,  # Make sure this id webinar is exists
        },
        desc="Test delete material from a webinar, should return error_code 0.",
    )
    delete_material_success.test(0)

    # 4. Test edit a material in a webinar
    edit_material_success = debug(
        "protected/material-edit",
        method="POST",
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
        payload={
            "id": 5,  # Make sure this id webinar is exists
            "event_attach": "https://example.com/updated_material.pdf",  # URL of
        },
        desc="Test edit material in a webinar, should return error_code 0.",
    )
    edit_material_success.test(0)
