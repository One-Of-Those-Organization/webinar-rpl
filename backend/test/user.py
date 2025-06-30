import TestApi
import utils

debug = TestApi.TestApi

if __name__ == "__main__":

    admin_token = utils.login("admin@wowadmin.com", "secret")
    # user_token  = utils.login("bombardino@example.com", "")

    # -- START RESET PASS TEST -- #

    # NOTE: Reset pass is not possible since it need OTP code.
    # NOTE: Error 3 is not possible to test without database error.
    # NOTE: Error 5 is not possible to test without getting and knowing the OTP.
    # NOTE: Error 6 is impossible to get without getting hash error.
    # NOTE: Error 7 is impossible to get without database error.

    rpass1 = debug(
        "user-reset-pass",
        method="POST",
        payload={
            "otp_code": "",
            "email": "",
            "pass": ""
        },
        desc="Test the reset password with invalid fields, it should return error_code 2.",
    )
    rpass1.test(2)

    rpass2 = debug(
        "user-reset-pass",
        method="POST",
        payload={
            "email": "commrade@example.com",
            "pass": "secure-password123",
            "otp_code": "0000000"
        },
        desc="Test the register with invalid otp or user fields, it should return error_code 4.",
    )
    rpass2.test(4)

    # -- END RESET PASS TEST -- #

    # -- START REGISTER TEST -- #

    # NOTE: Register Not possible since it need OTP code.
    # NOTE: Error 4 is impossible to get without database error.
    # NOTE: Error 6 is impossible to get without getting hash error.
    # NOTE: Error 8 is impossible to get without database error.
    # NOTE: Error 9 is impossible to get without database error.
    # NOTE: Error 11 is impossible to get without getting the otp code first.

    register_error_2 = debug(
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
    register_error_2.test(2)

    register_error_3 = debug(
        "register",
        method="POST",
        payload={
            "name": "A",
            "email": "aaaaaaaaaaaa",
            "instance": "Jobless",
            "pass": "secure-password123",
            "otp_code": "9090"
        },
        desc="Test the register with invalid email fields, it should return error_code 3.",
    )
    register_error_3.test(3)

    register_error_5 = debug(
        "register",
        method="POST",
        payload={
            "name": "Goad",
            "email": "commrade@example.com",
            "instance": "Jobless",
            "pass": "secure-password123",
            "otp_code": "9090"
        },
        desc="Test the register with registered email, it should return error_code 5.",
    )
    register_error_5.test(5)

    register_error_10 = debug(
        "register",
        method="POST",
        payload={
            "name": "Wow",
            "email": "newemail@email.com",
            "instance": "Jobless",
            "pass": "secure-password123",
            "otp_code": "0000000"
        },
        desc="Test the register with invalid otp code, it should return error_code 10.",
    )
    register_error_10.test(10)

    # -- END REGISTER TEST -- #

    # -- START LOGIN TEST -- #

    # NOTE: Error 4 is impossible to get without database error.
    # NOTE: Error 6 is impossible to get without jwt gen error on backend.

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

    ltest1= debug(
        "login",
        method="POST",
        payload={
            "email": "",
            "pass": ""
        },
        desc="Test the login with empty email and password fields, it should return error_code 2.",
    )
    ltest1.test(2)

    ltest2= debug(
        "login",
        method="POST",
        payload={
            "email": "aaaaaa",
            "pass": "none"
        },
        desc="Test the login with invalid email field, it should return error_code 3.",
    )
    ltest2.test(3)

    ltest3= debug(
        "login",
        method="POST",
        payload={
            "email": "commrade@example.com",
            "pass": "none"
        },
        desc="Test the login with invalid password field, it should return error_code 5.",
    )
    ltest3.test(5)

    # -- END LOGIN TEST -- #

    # -- START USER INFO OF TEST -- #

    # NOTE: Error 1 is not tested because it will 100% work.
    # NOTE: Error 4 is not possible to test without database error.

    iftest1 = debug(
        "protected/user-info-of",
        method="GET",
        headers={ "Authorization": f"Bearer {admin_token}", "Content-Type": "application/json" },
        desc="Test the info of api with empty email field, it should return error_code 2.",
    )
    iftest1.test(2)

    iftest2 = debug(
        "protected/user-info-of?email=notregsitered@woho.com",
        method="GET",
        headers={ "Authorization": f"Bearer {admin_token}", "Content-Type": "application/json" },
        desc="Test the info of api with not regsitered email field, it should return error_code 3.",
    )
    iftest2.test(3)

    iftest3 = debug(
        "protected/user-info-of?email=commrade@example.com",
        method="GET",
        headers={ "Authorization": f"Bearer {admin_token}", "Content-Type": "application/json" },
        desc="Test the info of api with regsitered email, it should return error_code 0.",
    )
    iftest3.test(0)

    # -- END USER INFO OF TEST -- #

    # -- START USER EDIT ADMIN TEST -- #

    euatest1 = debug(
        "protected/edit-admin-user",
        method="POST",
        headers={
            "Authorization": f"Bearer {admin_token}",
        },
        payload={
            "email": "commrade@example.com",
            "instance": "Updated Instance",
            "picture": "https://example.com/avatar.png",
        },
        desc="Test the edit admin user api with valid arguments, it should return error_code 0.",
    )
    euatest1.test(0)

    euatest2 = debug(
        "protected/edit-admin-user",
        method="POST",
        headers={
            "Authorization": f"Bearer {admin_token}",
        },
        payload="not a json",
        desc="Test the edit admin user api with invalid JSON body. Should return error_code 3.",
    )
    euatest2.test(3)

    euatest3 = debug(
        "protected/edit-admin-user",
        method="POST",
        headers={
            "Authorization": f"Bearer {admin_token}",
        },
        payload={
            "name": "No Email",
        },
        desc="Test the edit admin user api with missing email field. Should return error_code 4.",
    )
    euatest3.test(4)

    edit_admin_user_not_found = debug(
        "protected/edit-admin-user",
        method="POST",
        headers={
            "Authorization": f"Bearer {admin_token}",
        },
        payload={
            "email": "notfound@example.com",
        },
        desc="Test the edit admin user api with user not found or no changes made. Should return error_code 7.",
    )
    edit_admin_user_not_found.test(7)

    # -- END USER EDIT ADMIN TEST -- #

    # -- START USER DEL ADMIN TEST -- #

    # -- END USER DEL ADMIN TEST -- #

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

    # user_edit_success = debug(
    #     "protected/user-edit",
    #     method="POST",
    #     payload={
    #         "name": "Updated Name",
    #         "email": "commrade@example.com", # Exist email
    #         "instance": "Universitas Masa Depan Cerah",
    #         "picture": "https://example.com/picture.jpg"
    #     },
    #     desc="Test update user by user, should return error_code 0."
    # )
    # user_edit_success.test(0)
    #
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
