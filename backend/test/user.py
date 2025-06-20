import TestApi

admin_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6MSwiZW1haWwiOiJjb21tcmFkZUBleGFtcGxlLmNvbSIsImV4cCI6MTc1MDYwNzI4NH0.aACYo6XIx0iOf3NRjZlPBnUov18uqo4Yvmd9aRT1bL0"
debug = TestApi.TestApi

if __name__ == "__main__":
    register_success = TestApi.TestApi(
        "register",
        method="POST",
        payload={
            "name": "Federico Matthew Pratama",
            "email": "federicomatthewpratamaa@gmail.com",
            "instance": "UKDC",
            "pass": "bombardino123",
            "otp_code": "px94"
        },
        desc="Test the register with valid email, password, and OTP, it should return error_code 0.",
    )
    register_success.test(0)
    
    register_error = debug(
        "register",
        method="POST",
        payload={
            "name": "",
            "email": "",
            "instance": "",
            "pass": "",
            "otp_code": ""
        },
        desc="Test the register with empty fields, it should return error_code 2.",
    )
    register_error.test(1)
            
    login_success = debug(
        "login",
        method="POST",
        payload={
            "email": "commrade@example.com",
            "pass": "secure-password123"
        },
        desc="Test the login with valid credentials, it should return error_code 0.",
    )
    login_success.test(0)
    
    login_error = debug(
        "login",
        method="POST",
        payload={
            "email": "",
            "pass": ""
        },
        desc="Test the login with empty fields, it should return error_code 2.",
    )
    login_error.test(1)
    
    admin_register_success = debug(
        "protected/register-admin",
        method="POST",
        headers={ "Authorization": f"Bearer {admin_token}", "Content-Type": "application/json" },
        payload={
            "name": "Debugging",
            "email": "debug@gmail.com",
            "instance": "UKDC",
            "pass": "debug123",
        },
        desc="Test the register by admin, it should return error_code 0."
    )
    admin_register_success.test(0)
    
    admin_register_error = debug(
        "protected/register-admin",
        method="POST",
        headers={ "Authorization": f"Bearer {admin_token}", "Content-Type": "application/json" },
        payload={
            "name": "",
            "email": "",
            "instance": "",
            "pass": "",
        },
        desc="Test the register by admin with empty fields, it should return error_code 4."
    )
    admin_register_error.test(1)
    
    admin_delete_user_success = debug(
        "protected/user-del-admin",
        method="POST",
        headers={ "Authorization": f"Bearer {admin_token}", "Content-Type": "application/json" },
        payload={
            "id": 1
        },
        desc="Test the delete user by admin, it should return error_code 0."
    )
    admin_delete_user_success.test(0)
    
    admin_delete_user_error = debug(
        "protected/user-del-admin",
        method="POST",
        headers={ "Authorization": f"Bearer {admin_token}", "Content-Type": "application/json" },
        payload={
            "id": 9999
        },
        desc="Test the delete user by admin with non-existent user ID, it should return error_code 1."
    )
    admin_delete_user_error.test(1)
