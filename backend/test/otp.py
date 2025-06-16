import TestApi

if __name__ == "__main__":
    test1 = TestApi.TestApi(
        "gen-otp-for-register?email=fernandoperry1234@gmail.com",
        method="GET",
        desc="Test the gen OTP. If given a valid email, it should return error_code 0."
    )
    test1.test(0)

    test2 = TestApi.TestApi(
        "gen-otp-for-register?email=kuuun",
        method="GET",
        desc="Test the gen OTP with invalid email, it should return error_code 1."
    )
    test2.test(1)

    test2 = TestApi.TestApi(
        "gen-otp-for-register?email=",
        method="GET",
        desc="Test the gen OTP with invalid email, it should return error_code 1."
    )
    test2.test(1)
