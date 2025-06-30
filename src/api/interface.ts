// Interface definitions for API responses and requests

// == Base Response and Authentication Interfaces ==

// Base Response for every API promises
export interface BaseResponse {
  message: string;
  success: boolean;
  error_code?: number;
  token?: string;
  admin?: string;
  data?: any;
}

// Register Data (POST)
export interface RegisterData {
  name: string;
  email: string;
  instance: string;
  pass: string;
  picture?: string;
  otp_code: string;
}

// Login Data (POST)
export interface LoginData {
  email: string;
  pass: string;
}

// == User Data Interfaces ==

// Export User Data {JSON} This is also (GET)
export interface UserData {
  UserId: number;
  UserFullName: string;
  UserEmail: string;
  UserInstance: string;
  UserRole: number;
  UserPicture: string;
  UserCreatedAt: string;
}

// User Edit Data (POST)
export interface UserEditData {
  email?: string;
  name?: string;
  instance?: string;
  picture?: string;
  password?: string;
}

// User Image Data (POST)
export interface UserImage {
  data: string;
}

// User Table Data (GET)
export interface Users {
  originalData: {
    ID: number;
    UserFullName: string;
    UserEmail: string;
    UserInstance: string;
    UserRole: number;
    UserPicture: string | undefined;
    UserCreatedAt: string;
  };
  id: number;
  name: string;
  role: string;
  email: string;
  instansi: string;
  avatar?: string;
}

export interface UserResetPassword {
  email: string;
  pass: string;
  otp_code: string;
}

// Admin Register Data (POST)
export interface RegisterAdmin {
  email: string;
  name: string;
  pass: string;
  instance: string;
  picture: string;
  user_role: number; // 1 for Admin, 0 for User
}

// == Webinar Data Interfaces ==

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

  // Same as WebinarEdit, constructor to initialize properties
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

// Webinar Edit Data (POST)
export class WebinarEdit {
  id: number = 0;
  desc?: string = "";
  name?: string = "";
  dstart?: string = "";
  dend?: string = "";
  link?: string = "";
  speaker?: string = "";
  att?: string = "";
  img?: string = "";
  max?: number = 0;
  event_attach?: string = "";
  cert_template_id?: number = 0;
  panitia?: string[] = [];

  // Constructor to initialize properties so it wont red line
  constructor(init?: Partial<WebinarEdit>) {
    Object.assign(this, init);
  }

  // Static method to transform API response to WebinarEdit class instances
  static fromApiResponse(apiData: any): WebinarEdit {
    return new WebinarEdit({
      id: apiData.ID || 0,
      desc: apiData.EventDesc || "",
      name: apiData.EventName || "",
      dstart: apiData.EventDStart || "",
      dend: apiData.EventDEnd || "",
      speaker: apiData.EventSpeaker || "",
      att: apiData.EventAtt || "",
      link: apiData.EventLink || "",
      img: apiData.EventImg || "",
      max: apiData.EventMax || 0,
      event_attach: apiData.EventMatID || "",
      cert_template_id: apiData.CertTemplateID || 0,
      panitia: apiData.EventPanitia || [],
    });
  }
}

// Webinar Image Data (POST)
export interface WebinarImage {
  data: string;
}

// == Event Participant Interfaces ==

// Event Participant Register Data (POST)
// Might be used for Committee or Participant registration
export interface EventPartisipantRegister {
  id: number;
  role: string;
  email?: string;
}

// Event Participant Absence Data (POST)
// Used for Admin or Committee to mark participant absence
// And Used for User to Generate QR Code
export interface EventPartisipantAbsence {
  id: number;
  code: string;
}

export interface EventPartisipantEdit {
  event_id: number;
  event_role?: string;
  email?: string;
}

// == Material Interfaces ==

// Add Material Data (POST)
export interface AddMaterial {
  id: number;
  event_attach: string;
}

export interface EditMaterial {
  id: number;
  event_id?: number;
  event_attach?: string;
}
