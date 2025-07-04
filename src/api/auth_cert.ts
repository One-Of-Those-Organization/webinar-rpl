// API Certificate Usage List

// 1/1 Completed ✅

// 1. Create Certificate from Event ✅

import { API_URL } from "@/api/endpoint";
import { BaseResponse } from "./interface";

export const auth_cert = {
  create_cert: async (eventID: number): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const data = JSON.stringify({
        event_id: Number(eventID),
      });

      const response = await fetch(
        `${API_URL}/api/protected/create-new-cert-from-event`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: data,
        },
      );
      return await response.json();
    } catch (error) {
      return {
        message: "Failed to connect to server",
        success: false,
      };
    }
  },
};
