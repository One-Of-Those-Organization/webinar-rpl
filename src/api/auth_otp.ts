import { BaseResponse } from "./interface";

const API_URL = "http://localhost:3000";

export const auth_otp = {
  // API untuk mengirim OTP
  send_otp: async (email: string): Promise<BaseResponse> => {
    try {
      const response = await fetch(
        `${API_URL}/api/gen-otp-for-register?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },
};
