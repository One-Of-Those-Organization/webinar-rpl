import { BaseResponse, EventPartisipantRegister } from "./interface";

const API_URL = "http://localhost:3000";

export const auth_participants = {
  // API Participant Register
  register: async (data: EventPartisipantRegister): Promise<BaseResponse> => {
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
};
