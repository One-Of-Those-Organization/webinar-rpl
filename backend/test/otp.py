import TestApi
import utils

if __name__ == "__main__":
    admin_token = utils.login("admin@wowadmin.com", "secret")

    test1 = TestApi.TestApi(
        "gen-otp-for-register?email=federicomatthewpratamaa@gmail.com",
        method="GET",
        desc="Test the gen OTP. If given a valid email, it should return error_code 0."
    )
    test1.test(0)

    # test2 = TestApi.TestApi(
    #     "gen-otp-for-register?email=kuuun",
    #     method="GET",
    #     desc="Test the gen OTP with invalid email, it should return error_code 1."
    # )
    # test2.test(1)

    # test3 = TestApi.TestApi(
    #     "gen-otp-for-register?email=",
    #     method="GET",
    #     desc="Test the gen OTP with invalid email, it should return error_code 1."
    # )
    # test3.test(1)

    # test4 = TestApi.TestApi(
    #     url="protected/cleanup-otp-code",
    #     method="POST",
    #     desc="Test that admin can cleanup unused and old OTP code, it should return error_code 0.",
    #     headers={ "Authorization": f"Bearer {admin_token}", "Content-Type": "application/json" },
    # )
    # test4.test(0)

    # test5 = TestApi.TestApi(
    #     url="protected/cleanup-otp-code",
    #     method="POST",
    #     desc="Test normal user can cleanup unused and old OTP code, it should return error_code 1.",
    #     headers={ "Authorization": f"Bearer some_token", "Content-Type": "application/json" },
    # )
    # test5.test(1)
