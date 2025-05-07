import {
  BaseResponse,
  RegisterData,
  LoginData,
  UserInfoData,
} from "./interface.ts";

const API_URL = "http://localhost:3000";

// Fungsi untuk menghubungkan ke API
export const auth = {
  // API Register
  register: async (data: RegisterData): Promise<BaseResponse> => {
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to server",
        error_code: -1,
      };
    }
  },

  // API Login
  login: async (data: LoginData): Promise<BaseResponse> => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return {
        message: "Failed to connect to server",
        success: false,
        error_code: -1,
      };
    }
  },

  // API Logout
  logout: async () => {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      localStorage.removeItem("token");
      return true;
    } catch (error) {
      return false;
    }
  },

  // API User Info
  userinfo: async (data: UserInfoData): Promise<BaseResponse> => {
    try {
      const response = await fetch(`${API_URL}/api/user-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to server",
        error_code: -1,
      };
    }
  },
};
