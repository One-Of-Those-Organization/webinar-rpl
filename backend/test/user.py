import TestApi
import utils

debug = TestApi.TestApi

if __name__ == "__main__":

    admin_token = utils.login("admin@wowadmin.com", "secret")
    # user_token  = utils.login("bombardino@example.com", "")

    # ===============================================================
    #                      RESET PASSWORD TEST
    # ===============================================================

    # NOTE: Reset pass is not possible since it needs OTP code.
    # NOTE: Error 3 is not possible to test without DB error.
    # NOTE: Error 5 is not possible without knowing OTP.
    # NOTE: Error 6 is impossible without hash error.
    # NOTE: Error 7 is impossible without database error.

    # rpass_ok = debug(
    # "user-reset-pass",
    # method="POST",
    # payload={
    #     "email": "maoumashu@gmail.com",
    #     "pass": "NewSecurePass123.",
    #     "otp_code": "VALID_OTP_HERE"
    # },
    # desc="Reset pass success → error_code 0.",
    # )
    # rpass_ok.test(0)

    # rpass_err_2 = debug(
    #     "user-reset-pass",
    #     method="POST",
    #     payload={
    #         "otp_code": "",
    #         "email": "",
    #         "pass": ""
    #     },
    #     desc="Reset pass with empty fields → error_code 2.",
    # )
    # rpass_err_2.test(2)

    # rpass_err_3 = debug(
    # "user-reset-pass",
    # method="POST",
    # payload={
    #     "email": "this_email_not_exist@example.com",
    #     "pass": "SecurePassword123.",
    #     "otp_code": "1234"
    # },
    # desc="Reset pass with email not registered → error_code 3.",
    # )
    # rpass_err_3.test(3)

    # rpass_err_4 = debug(
    #     "user-reset-pass",
    #     method="POST",
    #     payload={
    #         "email": "commrade@example.com",
    #         "pass": "secure-password123",
    #         "otp_code": "0000000"
    #     },
    #     desc="Reset pass with invalid OTP → error_code 4.",
    # )
    # rpass_err_4.test(4)

    # rpass_err_5 = debug(
    # "user-reset-pass",
    # method="POST",
    # payload={
    #     "email": "maoumashu@gmail.com",
    #     "pass": "123",
    #     "otp_code": "VALID_OTP_HERE"
    # },
    # desc="Reset pass with weak password → error_code 5.",
    # )
    # rpass_err_5.test(5)

    # ===============================================================
    #                          REGISTER TEST
    # ===============================================================

    # NOTE: Register not possible since OTP required.
    # NOTE: Error 4 / 6 / 8 / 9 / 11 cannot be triggered without DB or hash errors.
    
    # # Test 0 → All valid → error_code 0
    # register_ok = debug(
    # "register",
    # method="POST",
    # payload={
    #     "name": "Maou Mashu",
    #     "email": "maoumashu@gmail.com",
    #     "instance": "UKDC",
    #     "pass": "SecurePassword123.",
    #     "otp_code": "72N8"   # nanti kamu isi OTP asli
    # },
    # desc="Register success → error_code 0.",
    # )
    # register_ok.test(0)

    # # Test 1 → Empty fields → error_code 2
    # register_err_1 = debug(
    #     "register",
    #     method="POST",
    #     payload={
    #         "name": "",
    #         "email": "",
    #         "instance": "",
    #         "pass": "",
    #         "otp_code": ""
    #     },
    #     desc="TC1: Register with empty fields → expect error_code 2.",
    # )
    # register_err_1.test(2)

    # # Test 2 → Invalid email format → error_code 3
    # register_err_2 = debug(
    #     "register",
    #     method="POST",
    #     payload={
    #         "name": "A",
    #         "email": "aaaaaaaaaaaa",
    #         "instance": "Jobless",
    #         "pass": "secure-password123",
    #         "otp_code": "9090"
    #     },
    #     desc="TC2: Register with invalid email → expect error_code 3.",
    # )
    # register_err_2.test(3)

    # # Test 3 → Email already exists → error_code 5
    # register_err_3 = debug(
    #     "register",
    #     method="POST",
    #     payload={
    #         "name": "Goad",
    #         "email": "maoumashu@gmail.com",
    #         "instance": "Jobless",
    #         "pass": "secure-password123",
    #         "otp_code": "9090"
    #     },
    #     desc="TC3: Register with existing email → expect error_code 5.",
    # )
    # register_err_3.test(5)

    # # Test 4 → Invalid OTP → error_code 10
    # register_err_4 = debug(
    #     "register",
    #     method="POST",
    #     payload={
    #         "name": "Wow",
    #         "email": "newemail@email.com",
    #         "instance": "Jobless",
    #         "pass": "secure-password123",
    #         "otp_code": "0000000"
    #     },
    #     desc="TC4: Register with invalid OTP → expect error_code 10.",
    # )
    # register_err_4.test(10)

    # ===============================================================
    #                            LOGIN TEST
    # ===============================================================

    # # NOTE: Error 4 requires DB error.
    # # NOTE: Error 6 requires backend JWT error.

    # login_ok_user = debug(
    #     "login",
    #     method="POST",
    #     payload={
    #         "email": "maoumashu@gmail.com",
    #         "pass": "SecurePassword123."
    #     },
    #     desc="Login valid user → error_code 0.",
    # )
    # login_ok_user.test(0)

    # login_ok_admin = debug(
    #     "login",
    #     method="POST",
    #     payload={
    #         "email": "admin@wowadmin.com",
    #         "pass": "secret"
    #     },
    #     desc="Login valid admin → error_code 0.",
    # )
    # login_ok_admin.test(0)

    # login_err_2 = debug(
    #     "login",
    #     method="POST",
    #     payload={ "email": "", "pass": "" },
    #     desc="Login empty fields → error_code 2.",
    # )
    # login_err_2.test(2)

    # login_err_3 = debug(
    #     "login",
    #     method="POST",
    #     payload={ "email": "aaaaaa", "pass": "none" },
    #     desc="Login invalid email → error_code 3.",
    # )
    # login_err_3.test(3)

    # login_err_5 = debug(
    #     "login",
    #     method="POST",
    #     payload={
    #         "email": "maoumashu@gmail.com",
    #         "pass": "none"
    #     },
    #     desc="Login wrong password → error_code 5.",
    # )
    # login_err_5.test(5)

    # ===============================================================
    #                       USER INFO OF TEST
    # ===============================================================

    # NOTE: Error 1 always works.
    # NOTE: Error 4 needs DB error.

    # info_of_err_2 = debug(
    #     "protected/user-info-of",
    #     method="GET",
    #     headers={
    #         "Authorization": f"Bearer {admin_token}",
    #         "Content-Type": "application/json"
    #     },
    #     desc="User info-of empty email → error_code 2.",
    # )
    # info_of_err_2.test(2)

    # info_of_err_3 = debug(
    #     "protected/user-info-of?email=notregsitered@woho.com",
    #     method="GET",
    #     headers={
    #         "Authorization": f"Bearer {admin_token}",
    #         "Content-Type": "application/json"
    #     },
    #     desc="User info-of unregistered email → error_code 3.",
    # )
    # info_of_err_3.test(3)

    # info_of_ok = debug(
    #     "protected/user-info-of?email=commrade@example.com",
    #     method="GET",
    #     headers={
    #         "Authorization": f"Bearer {admin_token}",
    #         "Content-Type": "application/json"
    #     },
    #     desc="User info-of valid email → error_code 0.",
    # )
    # info_of_ok.test(0)

    # ===============================================================
    #                     EDIT ADMIN USER TEST
    # ===============================================================

    # edit_admin_ok = debug(
    #     "protected/edit-admin-user",
    #     method="POST",
    #     headers={ "Authorization": f"Bearer {admin_token}" },
    #     payload={
    #         "email": "commrade@example.com",
    #         "instance": "Updated Instance",
    #         "picture": "https://example.com/avatar.png",
    #     },
    #     desc="Edit admin user valid → error_code 0.",
    # )
    # edit_admin_ok.test(0)

    # edit_admin_err_3 = debug(
    #     "protected/edit-admin-user",
    #     method="POST",
    #     headers={ "Authorization": f"Bearer {admin_token}" },
    #     payload="not a json",
    #     desc="Edit admin invalid JSON → error_code 3.",
    # )
    # edit_admin_err_3.test(3)

    # edit_admin_err_4 = debug(
    #     "protected/edit-admin-user",
    #     method="POST",
    #     headers={ "Authorization": f"Bearer {admin_token}" },
    #     payload={ "name": "No Email" },
    #     desc="Edit admin missing email → error_code 4.",
    # )
    # edit_admin_err_4.test(4)

    # edit_admin_err_7 = debug(
    #     "protected/edit-admin-user",
    #     method="POST",
    #     headers={ "Authorization": f"Bearer {admin_token}" },
    #     payload={ "email": "notfound@example.com" },
    #     desc="Edit admin user not found → error_code 7.",
    # )
    # edit_admin_err_7.test(7)

    # ===============================================================
    #                     USER DELETE ADMIN TEST
    # ===============================================================

    # del_admin_err_1 = debug(
    #     "protected/user-del-admin",
    #     method="POST",
    #     headers={ "Authorization": "LMAO" },
    #     payload={ "lol": True },
    #     desc="Del admin with invalid JWT → error_code 1.",
    # )
    # del_admin_err_1.test(1)

    # del_admin_err_2 = debug(
    #     "protected/user-del-admin",
    #     method="POST",
    #     headers={ "Authorization": f"Bearer {admin_token}" },
    #     payload={ "lol": True },
    #     desc="Del admin invalid payload → error_code 2.",
    # )
    # del_admin_err_2.test(2)

    # del_admin_ok = debug(
    #     "protected/user-del-admin",
    #     method="POST",
    #     headers={ "Authorization": f"Bearer {admin_token}" },
    #     payload={ "id": 3 },  # delete user bombardino
    #     desc="Del admin valid payload → error_code 0.",
    # )
    # del_admin_ok.test(0)

    # ===============================================================
    #                         USER EDIT TEST
    # ===============================================================

    # user_edit_ok = debug(
    #     "protected/user-edit",
    #     method="POST",
    #     headers={ "Authorization": f"Bearer {admin_token}" },
    #     payload={ "name": "Ken Thompson" },
    #     desc="User edit valid payload → error_code 0.",
    # )
    # user_edit_ok.test(0)

    # ===============================================================
    #                     USER INFO ALL TEST
    # ===============================================================

    # info_all_ok = debug(
    #     "protected/user-info-all",
    #     method="GET",
    #     headers={ "Authorization": f"Bearer {admin_token}" },
    #     desc="User info-all valid call → error_code 0.",
    # )
    # info_all_ok.test(0)

    # info_all_query_ok = debug(
    #     "protected/user-info-all?limit=100&offset=10",
    #     method="GET",
    #     headers={ "Authorization": f"Bearer {admin_token}" },
    #     desc="User info-all valid query → error_code 0.",
    # )
    # info_all_query_ok.test(0)

    # ===============================================================
    #                         USER INFO TEST
    # ===============================================================

    # user_info_ok = debug(
    #     "protected/user-info",
    #     method="GET",
    #     headers={ "Authorization": f"Bearer {admin_token}" },
    #     desc="User info valid call → error_code 0.",
    # )
    # user_info_ok.test(0)

    # ===============================================================
    #                        USER COUNT TEST
    # ===============================================================

    # user_count_ok = debug(
    #     "protected/user-count",
    #     method="GET",
    #     headers={ "Authorization": f"Bearer {admin_token}" },
    #     desc="User count valid call → error_code 0.",
    # )
    # user_count_ok.test(0)

    # ===============================================================
    #                    REGISTER ADMIN TEST
    # ===============================================================

    # reg_admin_ok = debug(
    #     "protected/register-admin",
    #     method="POST",
    #     headers={ "Authorization": f"Bearer {admin_token}" },
    #     payload={
    #         "email": "example@example.com",
    #         "name": "Example",
    #         "pass": "xaempel",
    #         "instance": "None",
    #         "picture": ""
    #     },
    #     desc="Register admin valid payload → error_code 0.",
    # )
    # reg_admin_ok.test(0)

    # reg_admin_err_3 = debug(
    #     "protected/register-admin",
    #     method="POST",
    #     headers={ "Authorization": f"Bearer {admin_token}" },
    #     payload={
    #         "name": "Example",
    #         "pass": "xaempel",
    #         "instance": "None",
    #         "picture": ""
    #     },
    #     desc="Register admin missing fields → error_code 3.",
    # )
    # reg_admin_err_3.test(3)

    # reg_admin_err_5 = debug(
    #     "protected/register-admin",
    #     method="POST",
    #     headers={ "Authorization": f"Bearer {admin_token}" },
    #     payload={
    #         "email": "example.com",
    #         "name": "Example",
    #         "pass": "xaempel",
    #         "instance": "None",
    #         "picture": ""
    #     },
    #     desc="Register admin invalid email → error_code 5.",
    # )
    # reg_admin_err_5.test(5)