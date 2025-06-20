import TestApi

admin_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6MSwiZW1haWwiOiJjb21tcmFkZUBleGFtcGxlLmNvbSIsImV4cCI6MTc1MDY5MDA4NH0.9A0ep17GT1tXXca70dO5OOMr_Gb_t-zViN-EKyvObxM"
debug = TestApi.TestApi

if __name__ == "__main__":
    # Generate OTP for registration tests
    generate_otp_success = debug(
        "gen-otp-for-register?email=federicomatthewpratamaa@gmail.com",
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
