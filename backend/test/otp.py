import TestApi
import utils

if __name__ == "__main__":
    admin_token = utils.login("admin@wowadmin.com", "secret")

    # ======================
    # GEN OTP FOR REGISTER
    # ======================

    # # Test 1: Valid email → expect 0
    # genotp_test_1 = TestApi.TestApi(
    #     "gen-otp-for-register?email=maoumashu@gmail.com",
    #     method="GET",
    #     desc="TC1: Valid email should return error_code 0."
    # )
    # genotp_test_1.test(0)

    # # Test 2: Invalid email format → expect 1
    # genotp_test_2 = TestApi.TestApi(
    #     "gen-otp-for-register?email=kuuun",
    #     method="GET",
    #     desc="TC2: Invalid email format should return error_code 1."
    # )
    # genotp_test_2.test(1)

    # # Test 3: Empty email → expect 1
    # genotp_test_3 = TestApi.TestApi(
    #     "gen-otp-for-register?email=",
    #     method="GET",
    #     desc="TC3: Empty email should return error_code 1."
    # )
    # genotp_test_3.test(1)

    # NOTE:
    # Error code 2, 3, 4 are difficult to force without mocking
    # but we still document them in the test suite format if needed.

    # ======================
    # CLEANUP OTP
    # ======================

    # # Test 4: Admin cleanup → expect 0
    # cleanup_test_1 = TestApi.TestApi(
    #     url="protected/cleanup-otp-code",
    #     method="POST",
    #     desc="TC4: Admin should successfully cleanup unused OTP → error_code 0.",
    #     headers={
    #         "Authorization": f"Bearer {admin_token}",
    #         "Content-Type": "application/json"
    #     },
    # )
    # cleanup_test_1.test(0)

    # # Test 5: Normal user cleanup → expect 2
    # cleanup_test_2 = TestApi.TestApi(
    #     url="protected/cleanup-otp-code",
    #     method="POST",
    #     desc="TC5: Normal user cannot cleanup OTP → error_code 2.",
    #     headers={
    #         "Authorization": "Bearer some_token",
    #         "Content-Type": "application/json"
    #     },
    # )
    # cleanup_test_2.test(2)