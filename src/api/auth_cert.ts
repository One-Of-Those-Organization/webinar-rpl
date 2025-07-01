import { API_URL } from "@/api/endpoint";
import {
  BaseResponse,
} from "./interface";

export const auth_cert = {
  create_cert: async (eventID: number): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return {
          message: "No authentication token found",
          success: false,
          error_code: -1,
        };
      }

      const data = JSON.stringify({
        "event_id": Number(eventID),
      });

      console.log("Creating certificate for event ID:", eventID);

      const response = await fetch(`${API_URL}/api/protected/create-new-cert-from-event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();
      console.log("Certificate creation response:", result);

      // Handle permission errors specifically
      if (!result.success && result.error_code === 7) {
        return {
          ...result,
          message: "Access denied: You need to be an admin or committee member for this event to create certificate templates.",
        };
      }

      return result;
    } catch (error) {
      console.error("Certificate creation error:", error);
      return {
        message: "Failed to connect to server",
        success: false,
        error_code: -2,
      };
    }
  },

  // Check if certificate template exists for event
  check_cert_exists: async (eventID: number): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return {
          message: "No authentication token found",
          success: false,
          error_code: -1,
        };
      }

      console.log("Checking certificate for event ID:", eventID);

      const response = await fetch(`${API_URL}/api/protected/cert-info-of?id=${eventID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      console.log("Certificate check response:", result);

      if (!result.success && result.error_code === 5) {
        return {
          success: false,
          message: "No certificate template found",
          error_code: 0,
          data: null,
        };
      }

      return result;
    } catch (error) {
      console.error("Certificate check error:", error);
      return {
        message: "Failed to connect to server",
        success: false,
        error_code: -2,
      };
    }
  },

  // FIXED: Upload background image with enhanced error handling
  uploadBackgroundImage: async (data: { data: string; event_id: string }): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return {
          message: "No authentication token found",
          success: false,
          error_code: -1,
        };
      }

      console.log("Uploading background image for event:", data.event_id);
      console.log("Token exists:", !!token);

      // Use FIXED protected endpoint
      const response = await fetch(`${API_URL}/api/protected/-cert-editor-upload-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload failed with status:", response.status, "Error:", errorText);
        
        // Try to parse JSON error response
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error_code === 2) {
            return {
              message: "Access denied: You need to be an admin or committee member for this event.",
              success: false,
              error_code: 2,
            };
          }
          return errorJson;
        } catch {
          return {
            message: `Upload failed: ${response.status} ${response.statusText}`,
            success: false,
            error_code: response.status,
          };
        }
      }

      const result = await response.json();
      console.log("Background image upload response:", result);

      // Handle permission errors specifically
      if (!result.success && result.error_code === 2) {
        return {
          ...result,
          message: "Access denied: You need to be an admin or committee member for this event.",
        };
      }

      return result;
    } catch (error) {
      console.error("Background image upload error:", error);
      return {
        message: "Failed to connect to server",
        success: false,
        error_code: -2,
      };
    }
  },

  // FIXED: Upload HTML template with enhanced error handling
  uploadHTMLTemplate: async (data: { data: string; event_id: string }): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return {
          message: "No authentication token found",
          success: false,
          error_code: -1,
        };
      }

      console.log("Uploading HTML template for event:", data.event_id);
      console.log("Token exists:", !!token);

      // Use FIXED protected endpoint
      const response = await fetch(`${API_URL}/api/protected/-cert-editor-upload-html`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload failed with status:", response.status, "Error:", errorText);
        
        // Try to parse JSON error response
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error_code === 2) {
            return {
              message: "Access denied: You need to be an admin or committee member for this event.",
              success: false,
              error_code: 2,
            };
          }
          return errorJson;
        } catch {
          return {
            message: `Upload failed: ${response.status} ${response.statusText}`,
            success: false,
            error_code: response.status,
          };
        }
      }

      const result = await response.json();
      console.log("HTML template upload response:", result);

      // Handle permission errors specifically
      if (!result.success && result.error_code === 2) {
        return {
          ...result,
          message: "Access denied: You need to be an admin or committee member for this event.",
        };
      }

      return result;
    } catch (error) {
      console.error("HTML template upload error:", error);
      return {
        message: "Failed to connect to server",
        success: false,
        error_code: -2,
      };
    }
  },

  // Frontend route URL untuk certificate editor
  get_cert_editor_url: (eventID: number): string => {
    return `/admin/sertifikat/editor?event_id=${eventID}`;
  },

  // Backend API URL untuk template (jika diperlukan)
  get_cert_template_api_url: (eventID: number): string => {
    return `${API_URL}/api/c/cert-editor?event_id=${eventID}`;
  },

  // Delete certificate template
  delete_cert_template: async (certTempID: number): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return {
          message: "No authentication token found",
          success: false,
          error_code: -1,
        };
      }

      const response = await fetch(`${API_URL}/api/protected/cert-del`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: certTempID }),
      });

      const result = await response.json();
      
      // Handle permission errors specifically
      if (!result.success && result.error_code === 2) {
        return {
          ...result,
          message: "Access denied: You need to be an admin or committee member for this event.",
        };
      }

      return result;
    } catch (error) {
      console.error("Certificate delete error:", error);
      return {
        message: "Failed to connect to server",
        success: false,
        error_code: -2,
      };
    }
  },

  // NEW: Check user permissions for certificate operations
  checkCertificatePermissions: async (eventID: number): Promise<BaseResponse> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return {
          message: "No authentication token found",
          success: false,
          error_code: -1,
        };
      }

      // Try to create a certificate to check permissions
      const result = await auth_cert.create_cert(eventID);
      
      if (result.error_code === 7) {
        return {
          message: "You need to be an admin or committee member for this event to access certificate features.",
          success: false,
          error_code: 7,
          data: { hasPermission: false }
        };
      }

      return {
        message: "You have permission to access certificate features.",
        success: true,
        error_code: 0,
        data: { hasPermission: true }
      };
    } catch (error) {
      console.error("Permission check error:", error);
      return {
        message: "Failed to check permissions",
        success: false,
        error_code: -2,
        data: { hasPermission: false }
      };
    }
  }
}