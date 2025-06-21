// API User Usage List :

// 8/9 Completed ✅

// 1. Register Admin ✅
// 2. Delete User (Admin Only) ✅
// 3. User Edit (Admin Only) ✅
// 4. User Edit (User Only) ✅
// 5. User Image (User Only) ✅
// 6. Update User Profile Picture (User Only) ✅
// 7. Get All Users (Admin Only) ✅
// 8. Get User by Email (Admin Only) ✅
// 9. Get User Count (Admin Only) ✅
// 10. Get Current User Info (User Only) ✅
// 11. User Reset Password (User Only) ✅

import {
  BaseResponse,
  UserEditData,
  UserImage,
  RegisterAdmin,
  UserResetPassword,
} from "./interface.ts";

const API_URL = "http://localhost:3000";

// Fungsi untuk menghubungkan ke API
export const auth_user = {
  // API Add New User
  register_admin: async (data: RegisterAdmin): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return {
          success: false,
          message: "No authenticaion token found",
          error_code: 401,
        };
      }

      const response = await fetch(`${API_URL}/api/protected/register-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        return {
          success: false,
          message: "Session expired. Please login again.",
          error_code: 401,
        };
      }

      const result = await response.json();

      if (result.success && result.token) {
        localStorage.setItem("token", result.token);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  // API Delete User
  user_del_admin: async (data: { id: number }): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/protected/user-del-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      return result;
    } catch (error) {
      return {
        message: "Failed to connect to server",
        success: false,
      };
    }
  },

  // POST: /api/protected/user-edit-admin (admin only)
  user_edit_admin: async (data: UserEditData): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/protected/user-edit-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

  // API Update Gambar
  post_update_user_pfp: async (data: string): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/protected/user-edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          picture: data,
        }),
      });
      const result = await response.json();
      return result;
    } catch {
      return {
        message: "Failed to connect to server",
        success: false,
      };
    }
  },

  // API Get All Users
  get_all_users: async (): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/protected/user-info-all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return await response.json();
    } catch (error) {
      return {
        message: "Failed to connect to server",
        success: false,
      };
    }
  },

  // Api get user by email same as get webinar by id but different type of data
  get_user_by_email: async (email: string): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/protected/user-info-of?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  // API Get User Count
  get_user_count: async (): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/protected/user-count`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  // API Get User Info
  get_current_user: async (): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/protected/user-info`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  // API User Reset Password
  user_reset_password: async (
    data: UserResetPassword
  ): Promise<BaseResponse> => {
    try {
      const response = await fetch(`${API_URL}/api/user-reset-pass`, {
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
};
