// Register Response
export interface BaseResponse {
  message: string;
  success: boolean;
  error_code: number;
  token?: string;
  admin?: string;
}

// Register Data
export interface RegisterData {
  name: string;
  email: string;
  instance: string;
  pass: string;
}

// Login Data
export interface LoginData {
  email: string;
  pass: string;
}

// User Info Data
export interface UserInfoData {
  email: string;
}
