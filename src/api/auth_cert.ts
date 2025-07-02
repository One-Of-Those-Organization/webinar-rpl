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

  // // Check if certificate template exists for event
  // check_cert_exists: async (eventID: number): Promise<BaseResponse> => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       return {
  //         message: "No authentication token found",
  //         success: false,
  //         error_code: -1,
  //       };
  //     }

  //     console.log("Checking certificate for event ID:", eventID);

  //     const response = await fetch(`${API_URL}/api/protected/cert-info-of?id=${eventID}`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     const result = await response.json();
  //     console.log("Certificate check response:", result);

  //     if (!result.success && result.error_code === 5) {
  //       return {
  //         success: false,
  //         message: "No certificate template found",
  //         error_code: 0,
  //         data: null,
  //       };
  //     }

  //     return result;
  //   } catch (error) {
  //     console.error("Certificate check error:", error);
  //     return {
  //       message: "Failed to connect to server",
  //       success: false,
  //       error_code: -2,
  //     };
  //   }
  // },

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
  },
  getCertificateTemplateContent: async (eventId: number): Promise<BaseResponse> => {
    try {
      const templateUrl = `${window.location.origin}/static/sertifikat/${eventId}/index.html`;
      const response = await fetch(templateUrl);
      
      if (response.ok) {
        const content = await response.text();
        return {
          success: true,
          message: "Template content loaded successfully",
          error_code: 0,
          data: { content }
        };
      } else {
        return {
          success: false,
          message: "Template file not found",
          error_code: 404,
          data: null
        };
      }
    } catch (error) {
      console.error("Failed to load template content:", error);
      return {
        success: false,
        message: "Failed to load template content",
        error_code: -1,
        data: null
      };
    }
  },

  // NEW: Check if background image exists
  checkBackgroundImageExists: async (eventId: number): Promise<BaseResponse> => {
    try {
      const imageUrl = `${window.location.origin}/static/sertifikat/${eventId}/bg.png`;
      const response = await fetch(imageUrl, { method: 'HEAD' });
      
      return {
        success: response.ok,
        message: response.ok ? "Background image exists" : "Background image not found",
        error_code: response.ok ? 0 : 404,
        data: { exists: response.ok, url: imageUrl }
      };
    } catch (error) {
      console.error("Failed to check background image:", error);
      return {
        success: false,
        message: "Failed to check background image",
        error_code: -1,
        data: { exists: false, url: null }
      };
    }
  },

  // NEW: Get certificate template viewer URL
  get_cert_template_viewer_url: (eventId: number): string => {
    return `/admin/sertifikat/view/${eventId}`;
  },

  // TAMBAHKAN method baru untuk mengecek file secara langsung
checkCertificateFileExists: async (eventId: number): Promise<BaseResponse> => {
  try {
    // Cek file HTML template
    const templateUrl = `${window.location.origin}/static/sertifikat/${eventId}/index.html`;
    const templateResponse = await fetch(templateUrl, { method: 'HEAD' });
    
    // Cek file background image
    const bgUrl = `${window.location.origin}/static/sertifikat/${eventId}/bg.png`;
    const bgResponse = await fetch(bgUrl, { method: 'HEAD' });
    
    const templateExists = templateResponse.ok;
    const bgExists = bgResponse.ok;
    
    if (templateExists || bgExists) {
      return {
        success: true,
        message: "Certificate files found",
        error_code: 0,
        data: {
          ID: eventId,
          EventId: eventId,
          CertTemplate: `static/sertifikat/${eventId}/index.html`,
          templateExists,
          bgExists,
          templateUrl,
          bgUrl
        }
      };
    } else {
      return {
        success: false,
        message: "No certificate files found",
        error_code: 404,
        data: null
      };
    }
  } catch (error) {
    console.error("Failed to check certificate files:", error);
    return {
      success: false,
      message: "Failed to check certificate files",
      error_code: -1,
      data: null
    };
  }
},

// PERBAIKI method check_cert_exists yang ada
check_cert_exists: async (eventID: number): Promise<BaseResponse> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      // Jika tidak ada token, langsung cek file
      return auth_cert.checkCertificateFileExists(eventID);
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

    if (!result.success) {
      // Jika API gagal, fallback ke file check
      console.log("API check failed, falling back to file check...");
      return auth_cert.checkCertificateFileExists(eventID);
    }

    return result;
  } catch (error) {
    console.error("Certificate check error:", error);
    // Jika ada error, fallback ke file check
    return auth_cert.checkCertificateFileExists(eventID);
  }
},
}