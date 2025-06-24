import { BaseResponse } from "./interface";

const API_URL = "http://localhost:3000";

export const auth_certificate = {
  // Upload certificate template
  uploadTemplate: async (data: {
    event_name: string;
    data_html: string;
    data_img: string;
  }): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Uploading certificate template:", {
        event_name: data.event_name,
        data_html_length: data.data_html.length,
        data_img_length: data.data_img.length,
        has_image: data.data_img.length > 0
      });
      
      const response = await fetch(
        `${API_URL}/api/protected/cert-upload-template`,
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
      console.log("🔍 Upload template result:", result);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.message || 'Upload failed'}`);
      }
      
      return result;
    } catch (error) {
      console.error("Upload template error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to connect to server",
      };
    }
  },

  // Register certificate template for event
  registerCertificate: async (data: {
    id: number;
    cert_temp: string;
  }): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Registering certificate for event:", data.id);
      
      const response = await fetch(
        `${API_URL}/api/protected/cert-register`,
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
      console.log("🔍 Register certificate result:", result);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.message || 'Registration failed'}`);
      }
      
      return result;
    } catch (error) {
      console.error("Register certificate error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to connect to server",
      };
    }
  },

  // Get certificate info
  getCertificateInfo: async (id: number): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Getting certificate info for ID:", id);
      
      const response = await fetch(
        `${API_URL}/api/protected/cert-info-of?id=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const result = await response.json();
      console.log("🔍 Certificate info result:", result);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.message || 'Failed to get info'}`);
      }
      
      return result;
    } catch (error) {
      console.error("Get certificate info error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to connect to server",
      };
    }
  },

  // Delete certificate template
  deleteCertificate: async (id: number): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Deleting certificate ID:", id);
      
      const response = await fetch(
        `${API_URL}/api/protected/cert-del`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id }),
        }
      );
      
      const result = await response.json();
      console.log("🔍 Delete certificate result:", result);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.message || 'Delete failed'}`);
      }
      
      return result;
    } catch (error) {
      console.error("Delete certificate error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to connect to server",
      };
    }
  },

  // Edit certificate template
  editCertificate: async (data: {
    id: number;
    cert_path: string;
  }): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Editing certificate ID:", data.id);
      
      const response = await fetch(
        `${API_URL}/api/protected/cert-edit`,
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
      console.log("🔍 Edit certificate result:", result);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.message || 'Edit failed'}`);
      }
      
      return result;
    } catch (error) {
      console.error("Edit certificate error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to connect to server",
      };
    }
  },

  // List all certificate templates
  listTemplates: async (): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Listing certificate templates");
      
      // This endpoint might need to be implemented in backend
      const response = await fetch(
        `${API_URL}/api/protected/cert-list`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const result = await response.json();
      console.log("🔍 List templates result:", result);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.message || 'List failed'}`);
      }
      
      return result;
    } catch (error) {
      console.error("List templates error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to connect to server",
      };
    }
  }
};