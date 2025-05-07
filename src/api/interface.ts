// Base Response
export interface BaseResponse {
  message: string;
  success: boolean;
  error_code?: number;
  token?: string;
  admin?: string;
  data?: {
    UserFullName: string;
    UserEmail: string;
    UserInstance: string;
    UserCreatedAt: string;
  };
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
