import Cookies from "js-cookie";

interface LoginResponse {
  message: string;
  success: boolean;
  userId: number;
}

interface RegisterData {
  name: string;
  pass: string;
  email: string;
  instance: string;
  role: number;
  picture: string;
}

interface LoginData {
  email: string;
  pass: string;
}

const API_URL = "http://localhost:3000";

export const auth = {
  // API Register
  register: async (data: RegisterData): Promise<LoginResponse> => {
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
      console.error("Register error:", error);
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  // API Login
  login: async (data: LoginData): Promise<LoginResponse> => {
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
      console.error("Login error:", error);
      return {
        success: false,
        message: "Failed to connect to server",
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
      Cookies.remove("session_id");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  },
  // Continue Function here
};
