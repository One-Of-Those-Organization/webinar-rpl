import TestApi

admin_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6MSwiZW1haWwiOiJjb21tcmFkZUBleGFtcGxlLmNvbSIsImV4cCI6MTc1MDYwNzI4NH0.aACYo6XIx0iOf3NRjZlPBnUov18uqo4Yvmd9aRT1bL0"
user_token = ""
debug = TestApi.TestApi

if __name__ == "__main__":
    # register_success = TestApi.TestApi(
    #     "register",
    #     method="POST",
    #     # Implementation of the register with valid name, email, password, and OTP
    #     payload={
    #         "name": "Federico Matthew Pratama",
    #         "email": "federicomatthewpratamaa@gmail.com",
    #         "instance": "UKDC",
    #         "pass": "bombardino123",
    #         "otp_code": "px94"
    #     },
    #     desc="Test the register with valid email, password, and OTP, it should return error_code 0.",
    # )
    # register_success.test(0)
    
    # register_error = debug(
    #     "register",
    #     method="POST",
    #     # Intentionally empty fields to test error handling
    #     payload={
    #         "name": "",
    #         "email": "",
    #         "instance": "",
    #         "pass": "",
    #         "otp_code": ""
    #     },
    #     desc="Test the register with empty fields, it should return error_code 2.",
    # )
    # register_error.test(1)
            
    # login_success = debug(
    #     "login",
    #     method="POST",
    #     Implementation of the login with valid credentials
    #     payload={
    #         "email": "commrade@example.com",
    #         "pass": "secure-password123"
    #     },
    #     desc="Test the login with valid credentials, it should return error_code 0.",
    # )
    # login_success.test(0)
    
    # login_error = debug(
    #     "login",
    #     method="POST",
    #     # Intentionally empty fields to test error handling
    #     payload={
    #         "email": "",
    #         "pass": ""
    #     },
    #     desc="Test the login with empty fields, it should return error_code 2.",
    # )
    # login_error.test(1)
    
    # admin_register_success = debug(
    #     "protected/register-admin",
    #     method="POST",
    #     headers={ "Authorization": f"Bearer {admin_token}", "Content-Type": "application/json" },
    #     payload={
    #         # Valid admin registration
    #         "name": "Debugging",
    #         "email": "debug@gmail.com",
    #         "instance": "UKDC",
    #         "pass": "debug123",
    #     },
    #     desc="Test the register by admin, it should return error_code 0."
    # )
    # admin_register_success.test(0)
    
    # admin_register_error = debug(
    #     "protected/register-admin",
    #     method="POST",
    #     headers={ "Authorization": f"Bearer {admin_token}", "Content-Type": "application/json" },
    #     payload={
    #         # Intentionally empty fields to test error handling
    #         "name": "",
    #         "email": "",
    #         "instance": "",
    #         "pass": "",
    #     },
    #     desc="Test the register by admin with empty fields, it should return error_code 4."
    # )
    # admin_register_error.test(1)
    
    # admin_delete_user_success = debug(
    #     "protected/user-del-admin",
    #     method="POST",
    #     headers={ "Authorization": f"Bearer {admin_token}", "Content-Type": "application/json" },
    #     payload={
    #         "id": 1 # Existing user ID
    #     },
    #     desc="Test the delete user by admin, it should return error_code 0."
    # )
    # admin_delete_user_success.test(0)
    
    # admin_delete_user_error = debug(
    #     "protected/user-del-admin",
    #     method="POST",
    #     headers={ "Authorization": f"Bearer {admin_token}", "Content-Type": "application/json" },
    #     payload={
    #         "id": 9999 # Non-existent user ID
    #     },
    #     desc="Test the delete user by admin with non-existent user ID, it should return error_code 4."
    # )
    # admin_delete_user_error.test(1)

    # admin_edit_user_success = debug(
    #     "protected/user-edit-admin",
    #     method="POST",
    #     headers={ "Authorization": f"Bearer {admin_token}", "Content-Type": "application/json" },
    #     payload={
    #         "name": "Updated Name",
    #         "email": "bombardino@example.com", # Exist email
    #         "instance": "UKDC",
    #         "picture": "https://example.com/picture.jpg"
    #     },
    #     desc="Test update user by admin, should return error_code 0."
    # )
    # admin_edit_user_success.test(0)
    
    # admin_edit_user_error = debug(
    #     "protected/user-edit-admin",
    #     method="POST",
    #     headers={ "Authorization": f"Bearer {admin_token}", "Content-Type": "application/json" },
    #     payload={
    #         "name": "Updated Name",
    #         "email": "debug@gmail.com", # Non-exist email
    #         "instance": "UKDC",
    #         "picture": "https://example.com/picture.jpg"
    #     },
    #     desc="Test update user by admin, should return error_code 0."
    # )
    # admin_edit_user_error.test(0)
    
    user_edit_success = debug(
        "protected/user-edit",
        method="POST",
        payload={
            "name": "Updated Name",
            "email": "commrade@example.com", # Exist email
            "instance": "Universitas Masa Depan Cerah",
            "picture": "https://example.com/picture.jpg"
        },
        desc="Test update user by user, should return error_code 0."
    )
    user_edit_success.test(0)
    
    # user_edit_error = debug(
    #     "protected/user-edit",
    #     method="POST",
    #     payload={
    #         "name": "Updated Name",
    #         "email": "edwinalexander@gmail.com", # Non-exist email
    #         "instance": "Universitas Masa Depan Cerah",
    #         "picture": "https://example.com/picture.jpg"
    #     },
    #     desc="Test update user by user, should return error_code 0."
    # )
    # user_edit_error.test(0)
            