import TestApi
import utils

if __name__ == "__main__":
    admin_token = utils.login("admin@wowadmin.com", "secret")

    test1 = TestApi.TestApi(
        "gen-otp-for-register?email=fernandoperry1234@gmail.com",
        method="GET",
        desc="Test the gen OTP. If given a valid email, it should return error_code 0."
    )
    generate_otp_success.test(0)

    generate_otp_error_1 = debug(
        "gen-otp-for-register?email=kuuun",
        method="GET",
        desc="Test the gen OTP with invalid email, it should return error_code 1."
    )
    generate_otp_error_1.test(1)

    generate_otp_error_2 = debug(
        "gen-otp-for-register?email=",
        method="GET",
        desc="Test the gen OTP with invalid email, it should return error_code 1."
    )
    generate_otp_error_2(1)
    
    # Cleanup OTP code tests
    cleanup_otp_success = debug(
        url="protected/cleanup-otp-code",
        method="POST",
        desc="Test that admin can cleanup unused and old OTP code, it should return error_code 0.",
        headers={ "Authorization": f"Bearer {admin_token}", "Content-Type": "application/json" },
    )
    cleanup_otp_success.test(0)

    cleanup_otp_error = debug(
        url="protected/cleanup-otp-code",
        method="POST",
        desc="Test normal user can cleanup unused and old OTP code, it should return error_code 1.",
        headers={ "Authorization": f"Bearer some_token", "Content-Type": "application/json" },
    )
    cleanup_otp_error.test(1)
