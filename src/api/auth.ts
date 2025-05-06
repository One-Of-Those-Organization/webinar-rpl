// Kontrak yang harus dipenuhi oleh response dari API

export interface RegisterResponse {
  message: string;
  success: boolean;
  error_code: number;
}

interface RegisterData {
  name: string;
  email: string;
  instance: string;
  pass: string;
}

interface LoginResponse {
  message: string;
  success: boolean;
  token: string;
  error_code: number;
}

interface LoginData {
  email: string;
  pass: string;
}

// NOTE : Commented section are WIP

// export interface LupaPasswordResponse {
//   message: string;
//   success: boolean;
//   error_code: number;
// }

// interface LupaPasswordData {
//   pass: string;
// }

// export interface OTPLupaPasswordResponse {
//   message: string;
//   success: boolean;
//   error_code: number;
// }

// interface OTPLupaPasswordData {
//   otp: number;
// }

// Deklarasi URL API

const API_URL = "http://localhost:3000";

// Fungsi untuk menghubungkan ke API
export const auth = {
  // API Register
  register: async (data: RegisterData): Promise<RegisterResponse> => {
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
        error_code: 0,
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
      return {
        success: false,
        message: "Failed to connect to server",
        token: "",
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

  // API Lupa Password (Later)
  // lupa_password: async (
  //   data: LupaPasswordData
  // ): Promise<LupaPasswordResponse> => {
  //   try {
  //     const response = await fetch(`${API_URL}/api/lupa_password`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(data),
  //     });

  //     return await response.json();
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: "Failed to connect to server",
  //       error_code: -1,
  //     };
  //   }
  // },

  // API OTP Lupa Password (Later)
  // otp_lupa_password: async (
  //   data: OTPLupaPasswordData
  // ): Promise<OTPLupaPasswordResponse> => {
  //   try {
  //     const response = await fetch(`${API_URL}/api/otp_lupa_password`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(data),
  //     });

  //     return await response.json();
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: "Failed to connect to server",
  //       error_code: 0,
  //     };
  //   }
  // },
};
