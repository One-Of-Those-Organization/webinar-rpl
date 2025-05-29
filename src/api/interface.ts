// Base Response for promises
export interface BaseResponse {
  message: string;
  success: boolean;
  error_code?: number;
  token?: string;
  admin?: string;
  data?: any;
}

// Export User Data {JSON}
export interface UserData {
  UserId: number;
  UserFullName: string;
  UserEmail: string;
  UserInstance: string;
  UserRole: number;
  UserPicture: string;
  UserCreatedAt: string;
}

// Register Data (POST)
export interface RegisterData {
  name: string;
  email: string;
  instance: string;
  pass: string;
}

// Login Data (POST)
export interface LoginData {
  email: string;
  pass: string;
}

// User Edit Data (POST)
export interface UserEditData {
  name: string;
  instance: string;
  picture: string;
}

// User Image Data (POST)
export interface UserImage {
  data: string;
}

// Webinar Add Data (POST)
export interface WebinarInput {
  description: string;
  name: string;
  dstart: string;
  dend: string;
  speaker: string;
  att: string;
  link: string;
  image: string;
  max: number;
}
