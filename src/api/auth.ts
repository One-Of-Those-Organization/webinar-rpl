import {
  BaseResponse,
  RegisterData,
  LoginData,
  UserEditData,
  UserImage,
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
      const result = await response.json();

      if (result.success && result.token) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user_data", JSON.stringify(result.data));
      }
      return result;
    } catch (error) {
      return {
        message: "Failed to connect to server",
        success: false,
      };
    }
  },

  // API User Edit
  user_edit: async (data: UserEditData): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/protected/user-edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success && result.token) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user_data", JSON.stringify(result.data));
      }
      return result;
    } catch (error) {
      return {
        message: "Failed to connect to server",
        success: false,
      };
    }
  },

  // API User Image
  user_image: async (data: UserImage): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/protected/user-upload-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data: data.data }),
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        message: "Failed to connect to server",
        success: false,
      };
    }
  },
};
