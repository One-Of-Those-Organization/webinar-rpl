import TestApi
import utils

debug = TestApi.TestApi

if __name__ == "__main__":
    
    admin_token = utils.login("admin@wowadmin.com", "secret")
    
    # NOTE : This only test only the success way, 
    # the failed way is will be progressed later.

    # 1. Test registering for a webinar with valid payload
    register_webinar_success = debug(
        "protected/event-participate-register",
        method="POST",
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
        payload={
            "id" : 6, # Make sure this id webinar is exists
            "role": "normal", # "normal" or "committee"
            "email": "commrade@example.com" # make sure this email is not registered yet and exists
        },
        desc="Test register for webinar with valid payload, should return error_code 0.",
    )
    register_webinar_success.test(0)
    
    # 2. Get Participant data from a webinar
    get_participant_data_success = debug(
        "protected/event-participate-of-event?event_id=6",
        method="GET",
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
        desc="Test get participant data from a webinar, should return error_code 0.",
    )
    get_participant_data_success.test(0)
    
    # 3. Test edit a participant's role in a webinar
    edit_participant_role_success = debug(
        "protected/event-participate-edit",
        method="POST",
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
        payload={
            "event_id": 6,  # Make sure this id webinar is exists
            "event_role": "committee",  # "normal" or "committee"
            "email": "commrade@example.com", # Make sure this email is registered in the webinar
        },
        desc="Test edit participant's role in a webinar, should return error_code 0.",
    )
    edit_participant_role_success.test(0)
    
    # 4. Test deleting a participant from a webinar
    delete_participant_success = debug(
        "protected/event-participate-del",
        method="POST",
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
        payload={
            "event_id": 6,  # Make sure this id webinar is exists
            "email": "commrade@example.com",
        },
        desc="Test delete participant from a webinar, should return error_code 0.",
    )
    delete_participant_success.test(0)
    
    # 5. Test getting a type of user's role in a webinar
    get_user_role_success = debug(
        "protected/event-participate-info-of?email=commrade@example.com&event_id=6",
        method="GET",
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
        desc="Test get user's role in a webinar, should return error_code 0.",
    )
    get_user_role_success.test(0)
    
    # 6. Test set absence status for a participant in a webinar
    set_absence_status_success = debug(
        "protected/event-participate-register",
        method="POST",
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
        payload={
            "id": 12,  # Make sure this id webinar is exists
            "role": "normal",  # "normal" or "committee"
            "email": "commrade@example.com",  # Make sure this email is registered in the webinar
        },
        desc="Test set absence status for a participant in a webinar, should return error_code 0.",
    )
    set_absence_status_success.test(0)
    
    # 7. Test get all participants in a webinar (count)
    get_all_participants_count_success = debug(
        "protected/event-participate-of-event-count?id=6",
        method="GET",
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
        desc="Test get all participants count in a webinar, should return error_code 0.",
    )
    get_all_participants_count_success.test(0)
    
    # 8. Test get all participants history webinar that already registered or attended
    get_all_participants_history_success = debug(
        "protected/event-participate-of-user?email=commrade@example.com",
        method="GET",
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
        desc="Test get all participants history of a user, should return error_code 0.",
    )
    get_all_participants_history_success.test(0)
    
    # 9. Test absence status of a participant in a webinar (Online)
    get_absence_status_online_success = debug(
        "protected/event-participate-absence-bulk",
        method="POST",
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
        payload={
            "event_id": 6,
        },
        desc="Test get absence status of a participant in a webinar (Online), should return error_code 0.",
    )
    get_absence_status_online_success.test(0)
