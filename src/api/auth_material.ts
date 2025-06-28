import { BaseResponse, AddMaterial, EditMaterial } from "./interface";

const API_URL = "http://localhost:3000";

export const auth_material = {
  // API untuk menambahkan materi
  add_material: async (data: AddMaterial): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/protected/material-register`,
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

  // API untuk mendapatkan materi berdasarkan event
  get_material: async (event_id: number): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/protected/material-info-of?event_id=${event_id}`,
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

  // API untuk menghapus materi
  delete_material: async (id: number): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/protected/material-del`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },

  // API untuk mengedit materi
  edit_material: async (data: EditMaterial): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/protected/material-edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to connect to server",
      };
    }
  },
};
