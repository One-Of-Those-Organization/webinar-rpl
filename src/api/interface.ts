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
  picture?: string;
}

// Login Data (POST)
export interface LoginData {
  email: string;
  pass: string;
}

// User Edit Data (POST)
export interface UserEditData {
  email?: string;
  name: string;
  instance: string;
  picture: string;
  password?: string;
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
  event_mat_id?: number = 0;
  cert_template_id?: number = 0;

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
      event_mat_id: apiData.EventMatID || 0,
      cert_template_id: apiData.CertTemplateID || 0,
    });
  }
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

// Admin Register Data (POST)
export interface RegisterAdmin {
  email: string;
  name: string;
  pass: string;
  instance: string;
  picture?: string;
}

// Event Participant Register Data (POST)
// Might be used for Committee or Participant registration
export interface EventPartisipantRegister {
  event_id: number;
  role: string;
  email?: string;
}
