// API Participants Usage LisT :
// 1. Participant Register ✅
// 2. Get Participants by Event ✅
// 3. Edit Participant from Event ✅
// 4. Delete Participant from Event ✅
// 5. Get Event Participation Info ❌
// 6. Set Participant Absence ❌
// 7. Get Participant Count by Event ❌
// 8. Get Event Participation by User ❌

import { BaseResponse, EventPartisipantRegister } from "./interface";

const API_URL = "http://localhost:3000";

export const auth_participants = {
  // API Participant Register
  event_participate_register: async (
    data: EventPartisipantRegister
  ): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
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
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  // API Participant Committee List
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

  // API untuk edit participant dari event
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

  // API untuk delete participant dari event
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
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  // API untuk mengatur kehadiran partisipan
  event_participate_absence: async (data: {
    id: number;
    code: string;
  }): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
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
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  // API untuk mendapatkan jumlah partisipan dari event
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

  // API untuk mendapatkan partisipasi event berdasarkan user
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
  },
};
