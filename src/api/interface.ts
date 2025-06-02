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
  desc: string;
  name: string;
  dstart: string;
  dend: string;
  speaker: string;
  att: string;
  link: string;
  img: string;
  max: number;
}

// Static Webinar Data (GET)
export class Webinar {
  name: string = "";
  speaker: string = "";
  description: string = "";
  dstart: string = "";
  dend: string = "";
  att: string = "";
  link: string = "";
  img: string = "";
  id: number = 0;
  max: number = 0;

  constructor(init?: Partial<Webinar>) {
    Object.assign(this, init);
  }

  // Static method to transform API response to Webinar class instances
  static fromApiResponse(apiData: any): Webinar {
    return new Webinar({
      id: apiData.ID || 0,
      description: apiData.EventDesc || "",
      name: apiData.EventName || "",
      dstart: apiData.EventDStart || "",
      dend: apiData.EventDEnd || "",
      speaker: apiData.EventSpeaker || "",
      att: apiData.EventAtt || "",
      link: apiData.EventLink || "",
      img: apiData.EventImg || "",
      max: apiData.EventMax || 0,
    });
  }

  // Method to get fallback image if none exists
  get imageUrl(): string {
    return this.img || "https://heroui.com/images/hero-card-complete.jpeg";
  }
}

// Webinar Image Data (POST)
export interface WebinarImage {
  data: string;
}
