// API Auth Usage List :

// 3/3 Completed ✅

// 1. Register User ✅
// 2. Login User ✅
// 3. Logout User ✅

import { BaseResponse, RegisterData, LoginData } from "./interface.ts";
import { API_URL } from "@/api/endpoint";

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
      }
      return result;
    } catch (error) {
      return {
        message: "Failed to connect to server",
        success: false,
      };
    }
  },

  // API Logout
  logout: async (): Promise<BaseResponse> => {
    try {
      const response = await fetch(`${API_URL}/api/c/logout`, {
        method: "POST",
        credentials: "include",
      });
      return await response.json();
    } catch (error) {
      return {
        message: "Failed to connect to server",
        success: false,
      };
    }
  },
};
