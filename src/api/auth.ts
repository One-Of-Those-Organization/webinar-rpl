// Kontrak yang harus dipenuhi oleh response dari API

interface LoginResponse {
  message: string;
  success: boolean;
  token: string;
}

interface RegisterData {
  name: string;
  pass: string;
  email: string;
  instance: string;
}

interface LoginData {
  email: string;
  pass: string;
}

// Deklarasi URL API

const API_URL = "http://localhost:3000";

// Fungsi untuk menghubungkan ke API
export const auth = {
  // API Register
  register: async (data: RegisterData): Promise<LoginResponse> => {
    console.log(data);
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
        token: "",
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
        token: "",
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
      console.error("Login error:", error);
      return false;
    }
  },
};
