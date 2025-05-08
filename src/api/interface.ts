// Base Response
export interface BaseResponse {
  message: string;
  success: boolean;
  error_code?: number;
  token?: string;
  admin?: string;
  data?: any;
}

// Export UserData {JSON}
export interface UserData {
  UserId: number;
  UserFullName: string;
  UserEmail: string;
  UserInstance: string;
  UserRole: number;
  UserPicture: string;
  UserCreatedAt: string;
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
