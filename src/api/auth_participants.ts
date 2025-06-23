import { BaseResponse, EventPartisipantRegister } from "./interface";

const API_URL = "http://localhost:3000";

export const auth_participants = {
  // API Participant Register
  event_participate_register: async (
    data: EventPartisipantRegister
  ): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Registering participant:", data);
      
      const response = await fetch(
        `${API_URL}/api/protected/event-participate-register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );
      
      const result = await response.json();
      console.log("🔍 Registration API response:", result);
      return result;
    } catch (error) {
      console.error("Registration API error:", error);
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  // API untuk mendapatkan informasi partisipasi event
  event_participate_info: async (
    eventId: number,
    email?: string
  ): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ event_id: eventId.toString() });
      if (email) {
        params.append("email", email);
      }

      console.log("🔍 Checking participation for event:", eventId);
      
      const response = await fetch(
        `${API_URL}/api/protected/event-participate-info-of?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const result = await response.json();
      console.log("🔍 Participation check result:", result);
      
      return result;
    } catch (error) {
      console.error("Participation check error:", error);
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  // API untuk mendapatkan QR Code data untuk check-in
  get_qr_code_data: async (eventId: number): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Getting QR code data for event:", eventId);
      
      const response = await fetch(
        `${API_URL}/api/protected/event-participate-info-of?event_id=${eventId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const result = await response.json();
      console.log("🔍 QR code data result:", result);
      
      return result;
    } catch (error) {
      console.error("QR code data error:", error);
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  // API untuk mengatur kehadiran partisipan (QR Code attendance)
  submitAttendance: async (data: {
    id: number;
    code: string;
  }): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Submitting attendance:", data);
      
      const response = await fetch(
        `${API_URL}/api/protected/event-participate-absence`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );
      
      const result = await response.json();
      console.log("🔍 Attendance submission result:", result);
      return result;
    } catch (error) {
      console.error("Attendance submission error:", error);
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  // API untuk mendapatkan user profile/role
  get_user_profile: async (): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Getting user profile");
      
      const response = await fetch(
        `${API_URL}/api/protected/user-profile`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const result = await response.json();
      console.log("🔍 User profile result:", result);
      return result;
    } catch (error) {
      console.error("User profile error:", error);
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  // Other existing methods...
  get_participants_by_event: async (eventId: number): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/protected/event-participate-of-event?event_id=${eventId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  event_participate_edit: async (data: {
    event_id: number;
    email: string;
    event_role: string;
  }): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/protected/event-participate-edit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  event_participate_delete: async (data: {
    event_id: number;
    email: string;
  }): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/protected/event-participate-del`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  event_participate_count: async (eventId: number): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/protected/event-participate-of-event-count?id=${eventId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  event_participate_by_user: async (
    userEmail?: string
  ): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const body = userEmail ? { email: userEmail } : {};

      const response = await fetch(
        `${API_URL}/api/protected/event-participate-of-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  }
};