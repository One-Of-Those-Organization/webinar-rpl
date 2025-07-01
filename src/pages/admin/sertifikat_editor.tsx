import React, { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DefaultLayout from "@/layouts/default_admin";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Input,
  Slider,
  Divider,
  ButtonGroup,
  Chip,
} from "@heroui/react";
import { toast, ToastContainer } from "react-toastify";
import { Rnd } from "react-rnd";
import { auth_cert } from "@/api/auth_cert";
import { auth_webinar } from "@/api/auth_webinar";

// Types (keeping existing types)
interface TextElement {
  id: string;
  type: 'text' | 'dynamic';
  content: string;
  dynamicField?: 'UniqueID' | 'EventName' | 'UserName';
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  rotation: number;
}

interface TemplateSettings {
  aspectRatio: '4:3' | '16:9';
  backgroundColor: string;
  backgroundImage?: string;
  width: number;
  height: number;
  scale: number;
}

interface UserPermissions {
  hasPermission: boolean;
  isAdmin: boolean;
  isCommittee: boolean;
  canEdit: boolean;
  permissionMessage: string;
}

const ASPECT_RATIOS = {
  '4:3': { width: 800, height: 600 },
  '16:9': { width: 1920, height: 1080 }
};

const DYNAMIC_FIELDS = [
  { key: 'UniqueID', label: 'Unique ID', description: 'Participant unique identifier' },
  { key: 'EventName', label: 'Event Name', description: 'Name of the webinar/event' },
  { key: 'UserName', label: 'Participant Name', description: 'Full name of participant' }
];

const FONT_FAMILIES = [
  'Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Helvetica', 
  'Courier New', 'Arial Black', 'Impact', 'Comic Sans MS', 'Trebuchet MS'
];

const FONT_WEIGHTS = [
  { key: 'normal', label: 'Normal' },
  { key: 'bold', label: 'Bold' },
  { key: '300', label: 'Light' },
  { key: '600', label: 'Semi Bold' },
  { key: '900', label: 'Black' }
];

// Helper function to get current date/time in UTC
const getCurrentDateTime = () => {
  return "2025-07-01 09:39:20";
};

// Helper function to get current user
const getCurrentUser = () => {
  return "Mikaelazzz";
};

export default function CertificateEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get('event_id');
  const mode = searchParams.get('mode');

  // Get current user and time
  const currentUser = getCurrentUser();
  const currentDateTime = getCurrentDateTime();

  // State management
  const [elements, setElements] = useState<TextElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>({
    aspectRatio: '4:3',
    backgroundColor: '#ffffff',
    width: ASPECT_RATIOS['4:3'].width,
    height: ASPECT_RATIOS['4:3'].height,
    scale: 0.5
  });
  const [eventData, setEventData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [useLocalMode, setUseLocalMode] = useState(false);
  const [forceLocalMode, setForceLocalMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(mode === 'view');

  // Permission state
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    hasPermission: false,
    isAdmin: false,
    isCommittee: false,
    canEdit: false,
    permissionMessage: "Checking permissions..."
  });

  // Preview data
  const [previewData, setPreviewData] = useState({
    UniqueID: "CERT123456789",
    EventName: "Sample Webinar Event",
    UserName: currentUser
  });

  // Refs and modal hooks
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOpen: isPreviewOpen, onOpen: openPreview, onClose: closePreview } = useDisclosure();

  // UPDATED: Helper function to construct proper image URL for sertifikat structure
  const constructImageUrl = useCallback((filename: string) => {
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  if (filename.startsWith('data:')) {
    return filename;
  }
  
  const baseUrl = window.location.origin;
  
  // Handle new path structure: static/sertifikat/event_id/filename
  if (filename.includes('static/sertifikat/')) {
    return `${baseUrl}/${filename}`;
  }
  
  // Legacy path handling
  const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
  return `${baseUrl}/static/sertifikat/${eventId}/${cleanFilename}`;
}, [eventId]);


  // Calculate responsive scale based on container size
  const calculateScale = useCallback(() => {
    if (!canvasRef.current) return 0.5;
    
    const containerWidth = canvasRef.current.parentElement?.clientWidth || 800;
    const containerHeight = canvasRef.current.parentElement?.clientHeight || 600;
    
    const widthScale = (containerWidth * 0.8) / templateSettings.width;
    const heightScale = (containerHeight * 0.8) / templateSettings.height;
    
    return Math.min(widthScale, heightScale, 1);
  }, [templateSettings.width, templateSettings.height]);

  // ENHANCED: Check user permissions with better error handling
  const checkUserPermissions = useCallback(async () => {
    if (!eventId) return;

    try {
      const result = await auth_cert.checkCertificatePermissions(parseInt(eventId));
      
      if (result.success && result.data?.hasPermission) {
        setUserPermissions({
          hasPermission: true,
          isAdmin: true,
          isCommittee: true,
          canEdit: true,
          permissionMessage: "You have full access to certificate editor features."
        });
        setForceLocalMode(false);
      } else {
        let permissionMessage = "You need to be an admin or committee member for this event to edit certificates.";
        
        if (result.error_code === 5) {
          permissionMessage = "Event not found. Please check if the event exists.";
          toast.error("Event not found. Please verify the event ID and try again.");
        } else if (result.error_code === 7) {
          permissionMessage = "Access denied: You need to be an admin or committee member for this event.";
          toast.warning("Limited access: You can view the template but cannot make changes to the server.");
        }
        
        setUserPermissions({
          hasPermission: false,
          isAdmin: false,
          isCommittee: false,
          canEdit: false,
          permissionMessage
        });
        setForceLocalMode(true);
        setIsViewMode(true);
      }
    } catch (error) {
      console.error("Permission check failed:", error);
      setUserPermissions({
        hasPermission: false,
        isAdmin: false,
        isCommittee: false,
        canEdit: false,
        permissionMessage: "Unable to verify permissions. Working in local mode."
      });
      setForceLocalMode(true);
    }
  }, [eventId]);

  // Update scale when window resizes or aspect ratio changes
  useEffect(() => {
    const handleResize = () => {
      setTemplateSettings(prev => ({
        ...prev,
        scale: calculateScale()
      }));
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateScale]);

  // Load event data and check permissions on mount
  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) {
        toast.error("No event ID provided");
        navigate('/admin/webinar');
        return;
      }

      try {
        setIsLoading(true);
        
        // Check permissions first
        await checkUserPermissions();
        
        const result = await auth_webinar.get_webinar_by_id(parseInt(eventId));
        
        if (result.success && result.data) {
          setEventData(result.data);
          setPreviewData(prev => ({
            ...prev,
            EventName: result.data.EventName || result.data.event_name || result.data.name || "Sample Event"
          }));
          
          // If we have event data, re-check permissions in case the first check failed due to event not found
          if (!userPermissions.hasPermission) {
            setTimeout(() => checkUserPermissions(), 1000);
          }
        } else {
          setUseLocalMode(true);
          setEventData({
            EventName: `Event ${eventId}`,
            event_name: `Event ${eventId}`,
            EventSpeaker: "Unknown Speaker",
            ID: eventId,
            id: eventId
          });
          setPreviewData(prev => ({
            ...prev,
            EventName: `Event ${eventId}`
          }));
          toast.warning("Could not load event data from server. Using local mode.");
        }
      } catch (error) {
        setUseLocalMode(true);
        setEventData({
          EventName: `Event ${eventId}`,
          event_name: `Event ${eventId}`,
          EventSpeaker: "Unknown Speaker",
          ID: eventId,
          id: eventId
        });
        setPreviewData(prev => ({
          ...prev,
          EventName: `Event ${eventId}`
        }));
        toast.warning("Network error. Using local mode - you can still create certificates!");
      } finally {
        setIsLoading(false);
      }
    };

    loadEventData();
  }, [eventId, navigate, checkUserPermissions, userPermissions.hasPermission]);

  // Update template dimensions when aspect ratio changes
  useEffect(() => {
    const newDimensions = ASPECT_RATIOS[templateSettings.aspectRatio];
    setTemplateSettings(prev => ({
      ...prev,
      width: newDimensions.width,
      height: newDimensions.height,
      scale: calculateScale()
    }));
  }, [templateSettings.aspectRatio, calculateScale]);

  // Generate unique ID for elements
  const generateId = () => `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add new text element (only if user has permission)
  const addTextElement = useCallback((type: 'text' | 'dynamic', dynamicField?: string) => {
    if (isViewMode || !userPermissions.canEdit) {
      toast.warning("You don't have permission to add elements. " + userPermissions.permissionMessage);
      return;
    }
    
    const newElement: TextElement = {
      id: generateId(),
      type,
      content: type === 'text' ? 'Sample Text' : `{{.${dynamicField}}}`,
      dynamicField: dynamicField as any,
      x: templateSettings.width * 0.1,
      y: templateSettings.height * 0.1,
      width: templateSettings.width * 0.8,
      height: 50,
      fontSize: 24,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#000000',
      textAlign: 'center',
      rotation: 0
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
  }, [templateSettings.width, templateSettings.height, isViewMode, userPermissions.canEdit, userPermissions.permissionMessage]);

  // Update element properties (only if user has permission)
  const updateElement = useCallback((id: string, updates: Partial<TextElement>) => {
    if (isViewMode || !userPermissions.canEdit) {
      return;
    }
    
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  }, [isViewMode, userPermissions.canEdit]);

  // Delete element (only if user has permission)
  const deleteElement = useCallback((id: string) => {
    if (isViewMode || !userPermissions.canEdit) {
      toast.warning("You don't have permission to delete elements. " + userPermissions.permissionMessage);
      return;
    }
    
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  }, [selectedElement, isViewMode, userPermissions.canEdit, userPermissions.permissionMessage]);

  // Handle background image upload - LOCAL VERSION
  const handleBackgroundUploadLocal = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setTemplateSettings(prev => ({
          ...prev,
          backgroundImage: base64String
        }));
        toast.success("Background image loaded locally!");
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Local background upload error:", error);
      toast.error("Failed to load background image");
      setIsUploadingImage(false);
    }
  }, []);

  // ENHANCED: Handle background image upload - SERVER VERSION with updated path handling
  const handleBackgroundUploadServer = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !eventId) return;

    // Check permissions first
    if (!userPermissions.canEdit) {
      toast.warning("You don't have permission to upload images to the server. " + userPermissions.permissionMessage);
      handleBackgroundUploadLocal(event);
      return;
    }

    // Validate file size (5MB max)
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error("Image size must be less than 5MB");
      event.target.value = "";
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, and WebP images are allowed");
      event.target.value = "";
      return;
    }

    setIsUploadingImage(true);
    toast.info("Uploading background image to server...", { toastId: "uploadingBg" });
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        
        try {
          const result = await auth_cert.uploadBackgroundImage({
            data: base64String,
            event_id: eventId
          });

          if (result.success && result.data && result.data.filename) {
            const imageUrl = constructImageUrl(result.data.filename);
            
            setTemplateSettings(prev => ({
              ...prev,
              backgroundImage: imageUrl
            }));
            toast.success("Background image uploaded to server successfully!");
            toast.success(`Image saved to: ${result.data.filename}`);
          } else {
            // Handle specific error cases
            if (result.error_code === 2) {
              toast.error("Access denied: You need to be an admin or committee member for this event.");
              setForceLocalMode(true);
              setUserPermissions(prev => ({ ...prev, canEdit: false }));
            } else if (result.error_code === 5) {
              toast.error("Event not found. Please check if the event exists.");
            } else {
              toast.warning("Server upload failed, using local image instead");
            }
            
            // Fallback to local storage
            setTemplateSettings(prev => ({
              ...prev,
              backgroundImage: base64String
            }));
          }
        } catch (error) {
          console.error("Server upload error:", error);
          // Fallback to local storage
          setTemplateSettings(prev => ({
            ...prev,
            backgroundImage: base64String
          }));
          toast.warning("Network error, using local image");
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Background upload error:", error);
      toast.error("Failed to upload background image");
    } finally {
      setIsUploadingImage(false);
    }
  }, [eventId, constructImageUrl, userPermissions.canEdit, userPermissions.permissionMessage, handleBackgroundUploadLocal]);

  // Combined background upload handler
  const handleBackgroundUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (useLocalMode || forceLocalMode || isViewMode || !userPermissions.canEdit) {
      handleBackgroundUploadLocal(event);
    } else {
      handleBackgroundUploadServer(event);
    }
  }, [useLocalMode, forceLocalMode, isViewMode, userPermissions.canEdit, handleBackgroundUploadLocal, handleBackgroundUploadServer]);

  // Get display content for elements
  const getElementDisplayContent = useCallback((element: TextElement) => {
    if (element.type === 'dynamic' && element.dynamicField) {
      return previewData[element.dynamicField] || `{{.${element.dynamicField}}}`;
    }
    return element.content;
  }, [previewData]);

  // UPDATED: Generate HTML template with updated path structure
  const generateHTMLTemplate = useCallback(() => {
    const htmlElements = elements.map(element => {
      return `
        <div style="
          position: absolute;
          left: ${element.x}px;
          top: ${element.y}px;
          width: ${element.width}px;
          height: ${element.height}px;
          font-size: ${element.fontSize}px;
          font-family: '${element.fontFamily}';
          font-weight: ${element.fontWeight};
          color: ${element.color};
          text-align: ${element.textAlign};
          transform: rotate(${element.rotation}deg);
          display: flex;
          align-items: center;
          justify-content: ${element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start'};
          word-wrap: break-word;
          box-sizing: border-box;
        ">
          ${element.type === 'dynamic' && element.dynamicField 
            ? `{{.${element.dynamicField}}}` 
            : element.content
          }
        </div>
      `;
    }).join('');

    // UPDATED: Ensure background image URL points to sertifikat structure
    let backgroundImageUrl = '';
    if (templateSettings.backgroundImage) {
      if (templateSettings.backgroundImage.startsWith('data:')) {
        backgroundImageUrl = templateSettings.backgroundImage;
      } else {
        // Ensure the URL points to the correct sertifikat structure
        if (templateSettings.backgroundImage.includes('static/sertifikat/')) {
          backgroundImageUrl = templateSettings.backgroundImage.replace('/static/', '');
        } else if (templateSettings.backgroundImage.includes('sertifikat/')) {
          backgroundImageUrl = templateSettings.backgroundImage;
        } else {
          backgroundImageUrl = `sertifikat/${eventId}/bg.png`;
        }
      }
    }

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate Template</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          .certificate-container {
            position: relative;
            width: ${templateSettings.width}px;
            height: ${templateSettings.height}px;
            background-color: ${templateSettings.backgroundColor};
            ${backgroundImageUrl ? `background-image: url('${backgroundImageUrl}');` : ''}
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            overflow: hidden;
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          ${htmlElements}
        </div>
      </body>
      </html>
    `;
  }, [elements, templateSettings, eventId]);

  // ENHANCED: Save template with better error handling and logging
  const saveTemplate = useCallback(async () => {
    if (!eventId) {
      toast.error("No event ID provided");
      return;
    }

    if (elements.length === 0) {
      toast.error("Please add at least one element to the template");
      return;
    }

    // Check permissions
    if (!userPermissions.canEdit) {
      toast.warning("You don't have permission to save templates to the server. " + userPermissions.permissionMessage);
      downloadHTMLTemplate();
      return;
    }

    setIsSaving(true);
    toast.info("Saving certificate template to server...", { toastId: "savingTemplate" });
    
    try {
      const htmlContent = generateHTMLTemplate();
      const htmlBase64 = btoa(unescape(encodeURIComponent(htmlContent)));
      
      console.log("Saving template to server...");
      console.log("Template will be saved to: static/sertifikat/" + eventId + "/index.html");
      
      const result = await auth_cert.uploadHTMLTemplate({
        data: `data:text/html;base64,${htmlBase64}`,
        event_id: eventId
      });

      if (result.success) {
        toast.success("Certificate template saved to server successfully!");
        toast.success(`Template saved to: ${result.data?.filename || 'static/sertifikat/' + eventId + '/index.html'}`);
        setTimeout(() => {
          navigate('/admin/webinar');
        }, 3000);
      } else {
        console.log("Server save failed:", result);
        
        if (result.error_code === 2) {
          toast.error("❌ Access denied: You need to be an admin or committee member for this event to save templates.");
          setUserPermissions(prev => ({ ...prev, canEdit: false }));
          setForceLocalMode(true);
        } else if (result.error_code === 5) {
          toast.error("❌ Event not found. Please verify the event exists.");
        } else {
          toast.error(result.message || "Failed to save template to server");
        }
        
        downloadHTMLTemplate();
        toast.info("💾 Template downloaded as local backup instead.");
      }
    } catch (error) {
      console.error("Save template error:", error);
      toast.error("Failed to save template to server. Downloading as backup...");
      downloadHTMLTemplate();
    } finally {
      setIsSaving(false);
    }
  }, [eventId, elements, generateHTMLTemplate, navigate, userPermissions.canEdit, userPermissions.permissionMessage]);

  // Download HTML for local backup
  const downloadHTMLTemplate = useCallback(() => {
    if (elements.length === 0) {
      toast.error("Please add at least one element to the template");
      return;
    }

    try {
      const htmlContent = generateHTMLTemplate();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_template_event_${eventId}_${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Certificate template downloaded for backup!");
    } catch (error) {
      console.error("Download template error:", error);
      toast.error("Failed to download template");
    }
  }, [elements, eventId, generateHTMLTemplate]);

  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-lg">Loading certificate editor...</p>
            <p className="mt-2 text-sm text-gray-600">Checking permissions and loading event data...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Certificate {isViewMode ? 'Viewer' : 'Editor'}
              </h1>
              <p className="text-sm text-blue-600">
                Event: {eventData?.EventName || eventData?.event_name || eventData?.name || "Unknown Event"} (ID: {eventId})
              </p>
              
              {/* Permission Status */}
              <div className="flex items-center gap-2 mt-2">
                <Chip 
                  color={userPermissions.hasPermission ? "success" : "warning"} 
                  size="sm" 
                  variant="flat"
                >
                  {userPermissions.hasPermission ? "✓ Full Access" : "⚠ Limited Access"}
                </Chip>
                <span className="text-xs text-gray-600">
                                    {userPermissions.permissionMessage}
                </span>
              </div>

              {(useLocalMode || forceLocalMode) && (
                <p className="text-sm text-orange-600">
                  ⚠️ Local Mode: {forceLocalMode ? "Permission required for server features" : "Server connection failed"}
                </p>
              )}
              {isViewMode && (
                <p className="text-sm text-purple-600">👁️ View Mode: Template preview only</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <ButtonGroup size="sm">
                <Button
                  color="secondary"
                  variant="bordered"
                  onClick={() => navigate('/admin/webinar')}
                >
                  Back to Webinars
                </Button>
                
                {!isViewMode && (
                  <>
                    <Button
                      color="secondary"
                      variant="bordered"
                      onClick={openPreview}
                      isDisabled={elements.length === 0}
                    >
                      Preview
                    </Button>
                    <Button
                      color="warning"
                      variant="bordered"
                      onClick={downloadHTMLTemplate}
                      isDisabled={elements.length === 0}
                    >
                      Download Backup
                    </Button>
                    <Button
                      color="primary"
                      onClick={saveTemplate}
                      isLoading={isSaving}
                      isDisabled={elements.length === 0 || !userPermissions.canEdit}
                    >
                      {!userPermissions.canEdit ? "No Save Permission" : 
                       (useLocalMode || forceLocalMode) ? "Save (Will Auto-Download)" : "Save to static/sertifikat/" + eventId}
                    </Button>
                  </>
                )}
                
                {isViewMode && userPermissions.canEdit && (
                  <Button
                    color="primary"
                    onClick={() => setIsViewMode(false)}
                  >
                    Edit Template
                  </Button>
                )}
              </ButtonGroup>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Tools */}
          <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Permission Info */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Access Level</h3>
                </CardHeader>
                <CardBody className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Permission Level:</span>
                    <Chip 
                      color={userPermissions.hasPermission ? "success" : "danger"} 
                      size="sm"
                      variant="flat"
                    >
                      {userPermissions.hasPermission ? "Authorized" : "Limited"}
                    </Chip>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Admin Access:</span>
                    <Chip 
                      color={userPermissions.isAdmin ? "success" : "default"} 
                      size="sm"
                      variant="flat"
                    >
                      {userPermissions.isAdmin ? "Yes" : "No"}
                    </Chip>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Committee Access:</span>
                    <Chip 
                      color={userPermissions.isCommittee ? "success" : "default"} 
                      size="sm"
                      variant="flat"
                    >
                      {userPermissions.isCommittee ? "Yes" : "No"}
                    </Chip>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Can Edit:</span>
                    <Chip 
                      color={userPermissions.canEdit ? "success" : "warning"} 
                      size="sm"
                      variant="flat"
                    >
                      {userPermissions.canEdit ? "Yes" : "View Only"}
                    </Chip>
                  </div>
                  
                  {!userPermissions.hasPermission && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                      <p className="text-yellow-700 dark:text-yellow-300">
                        <strong>Note:</strong> You need to be an admin or committee member for this event to upload templates to the server.
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Event Info */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Event Information</h3>
                </CardHeader>
                <CardBody className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Event Name:</p>
                    <p className="text-sm text-gray-600">{eventData?.EventName || eventData?.event_name || eventData?.name || "Unknown Event"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Event ID:</p>
                    <p className="text-sm text-gray-600">{eventId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Speaker:</p>
                    <p className="text-sm text-gray-600">{eventData?.EventSpeaker || eventData?.event_speaker || eventData?.speaker || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Mode:</p>
                    <p className="text-sm text-gray-600">
                      {isViewMode ? "View Only" : (useLocalMode || forceLocalMode) ? "Local (Offline)" : "Server (Online)"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Current User:</p>
                    <p className="text-sm text-gray-600">{currentUser}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Current Time:</p>
                    <p className="text-sm text-gray-600">{currentDateTime}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Save Location:</p>
                    <p className="text-sm text-gray-600">
                      {userPermissions.canEdit ? 
                        `static/sertifikat/${eventId}/` : 
                        "Local download only"
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Background Image:</p>
                    <p className="text-sm text-gray-600">
                      {templateSettings.backgroundImage ? 
                        (templateSettings.backgroundImage.startsWith('data:') ? "Local" : "Server") : 
                        "None"
                      }
                    </p>
                  </div>
                  {templateSettings.backgroundImage && (
                    <div className="text-xs text-gray-500 break-all">
                      URL: {templateSettings.backgroundImage.length > 50 ? 
                        templateSettings.backgroundImage.substring(0, 50) + "..." : 
                        templateSettings.backgroundImage
                      }
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Template Settings */}
              {(!isViewMode && userPermissions.canEdit) && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Template Settings</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <Select
                      label="Aspect Ratio"
                      selectedKeys={[templateSettings.aspectRatio]}
                      onSelectionChange={(keys) => {
                        const ratio = Array.from(keys)[0] as '4:3' | '16:9';
                        setTemplateSettings(prev => ({ ...prev, aspectRatio: ratio }));
                      }}
                      size="sm"
                    >
                      <SelectItem key="4:3">4:3 (800x600)</SelectItem>
                      <SelectItem key="16:9">16:9 (1920x1080)</SelectItem>
                    </Select>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Background Color</label>
                      <input
                        type="color"
                        value={templateSettings.backgroundColor}
                        onChange={(e) => setTemplateSettings(prev => ({ 
                          ...prev, 
                          backgroundColor: e.target.value 
                        }))}
                        className="w-full h-10 rounded-lg border cursor-pointer"
                      />
                    </div>

                    <div>
                      <Button
                        size="sm"
                        variant="bordered"
                        onClick={() => fileInputRef.current?.click()}
                        isLoading={isUploadingImage}
                        className="w-full"
                        isDisabled={!userPermissions.canEdit}
                      >
                        {isUploadingImage ? "Processing..." : 
                         !userPermissions.canEdit ? "Upload Disabled" :
                         (useLocalMode || forceLocalMode) ? "Load Background Image (Local)" : `Upload to sertifikat/${eventId}/`}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundUpload}
                        className="hidden"
                        disabled={!userPermissions.canEdit}
                      />
                      {templateSettings.backgroundImage && (
                        <div className="mt-2">
                          <p className="text-xs text-green-600 mb-1">
                            Background {(useLocalMode || forceLocalMode) ? "loaded locally" : `saved to sertifikat/${eventId}/bg.png`}
                          </p>
                          <Button
                            size="sm"
                            color="danger"
                            variant="light"
                            onClick={() => setTemplateSettings(prev => ({ 
                              ...prev, 
                              backgroundImage: undefined 
                            }))}
                            isDisabled={!userPermissions.canEdit}
                          >
                            Remove Background
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Add Elements */}
              {(!isViewMode && userPermissions.canEdit) && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Add Elements</h3>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    <Button
                      size="sm"
                      variant="bordered"
                      onClick={() => addTextElement('text')}
                      className="w-full justify-start"
                      isDisabled={!userPermissions.canEdit}
                    >
                      📝 Add Text
                    </Button>
                    
                    <Divider />
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Dynamic Fields:</p>
                      {DYNAMIC_FIELDS.map(field => (
                        <Button
                          key={field.key}
                          size="sm"
                          color="primary"
                          variant="flat"
                          onClick={() => addTextElement('dynamic', field.key)}
                          className="w-full justify-start"
                          isDisabled={!userPermissions.canEdit}
                        >
                          🔗 {field.label}
                        </Button>
                      ))}
                    </div>

                    {!userPermissions.canEdit && (
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs text-center">
                        <p className="text-gray-600 dark:text-gray-300">
                          Elements can only be added by admins or committee members
                        </p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}

              {/* Element Properties */}
              {(!isViewMode && userPermissions.canEdit && selectedElementData) && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Element Properties</h3>
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        onClick={() => deleteElement(selectedElementData.id)}
                        isDisabled={!userPermissions.canEdit}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    {selectedElementData.type === 'text' && (
                      <Input
                        label="Content"
                        value={selectedElementData.content}
                        onValueChange={(value) => updateElement(selectedElementData.id, { content: value })}
                        size="sm"
                        isDisabled={!userPermissions.canEdit}
                      />
                    )}

                    {selectedElementData.type === 'dynamic' && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Dynamic Field: {selectedElementData.dynamicField}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {DYNAMIC_FIELDS.find(f => f.key === selectedElementData.dynamicField)?.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="X Position"
                        type="number"
                        value={selectedElementData.x.toString()}
                        onValueChange={(value) => updateElement(selectedElementData.id, { x: parseInt(value) || 0 })}
                        size="sm"
                        isDisabled={!userPermissions.canEdit}
                      />
                      <Input
                        label="Y Position"
                        type="number"
                        value={selectedElementData.y.toString()}
                        onValueChange={(value) => updateElement(selectedElementData.id, { y: parseInt(value) || 0 })}
                        size="sm"
                        isDisabled={!userPermissions.canEdit}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Width"
                        type="number"
                        value={selectedElementData.width.toString()}
                        onValueChange={(value) => updateElement(selectedElementData.id, { width: parseInt(value) || 0 })}
                        size="sm"
                        isDisabled={!userPermissions.canEdit}
                      />
                      <Input
                        label="Height"
                        type="number"
                        value={selectedElementData.height.toString()}
                        onValueChange={(value) => updateElement(selectedElementData.id, { height: parseInt(value) || 0 })}
                        size="sm"
                        isDisabled={!userPermissions.canEdit}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Font Size: {selectedElementData.fontSize}px</label>
                      <Slider
                        value={[selectedElementData.fontSize]}
                        onChange={(value) => {
                          if (userPermissions.canEdit) {
                            const fontSize = Array.isArray(value) ? value[0] : value;
                            updateElement(selectedElementData.id, { fontSize });
                          }
                        }}
                        minValue={8}
                        maxValue={120}
                        step={1}
                        className="w-full"
                        isDisabled={!userPermissions.canEdit}
                      />
                    </div>

                    <Select
                      label="Font Family"
                      selectedKeys={[selectedElementData.fontFamily]}
                      onSelectionChange={(keys) => {
                        if (userPermissions.canEdit) {
                          const font = Array.from(keys)[0] as string;
                          updateElement(selectedElementData.id, { fontFamily: font });
                        }
                      }}
                      size="sm"
                      isDisabled={!userPermissions.canEdit}
                    >
                      {FONT_FAMILIES.map(font => (
                        <SelectItem key={font}>{font}</SelectItem>
                      ))}
                    </Select>

                    <Select
                      label="Font Weight"
                      selectedKeys={[selectedElementData.fontWeight]}
                      onSelectionChange={(keys) => {
                        if (userPermissions.canEdit) {
                          const weight = Array.from(keys)[0] as string;
                          updateElement(selectedElementData.id, { fontWeight: weight });
                        }
                      }}
                      size="sm"
                      isDisabled={!userPermissions.canEdit}
                    >
                      {FONT_WEIGHTS.map(weight => (
                        <SelectItem key={weight.key}>{weight.label}</SelectItem>
                      ))}
                    </Select>

                    <Select
                      label="Text Align"
                      selectedKeys={[selectedElementData.textAlign]}
                      onSelectionChange={(keys) => {
                        if (userPermissions.canEdit) {
                          const align = Array.from(keys)[0] as 'left' | 'center' | 'right';
                          updateElement(selectedElementData.id, { textAlign: align });
                        }
                      }}
                      size="sm"
                      isDisabled={!userPermissions.canEdit}
                    >
                      <SelectItem key="left">Left</SelectItem>
                      <SelectItem key="center">Center</SelectItem>
                      <SelectItem key="right">Right</SelectItem>
                    </Select>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Text Color</label>
                      <input
                        type="color"
                        value={selectedElementData.color}
                        onChange={(e) => {
                          if (userPermissions.canEdit) {
                            updateElement(selectedElementData.id, { color: e.target.value });
                          }
                        }}
                        className="w-full h-10 rounded-lg border cursor-pointer"
                        disabled={!userPermissions.canEdit}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Rotation: {selectedElementData.rotation}°</label>
                      <Slider
                        value={[selectedElementData.rotation]}
                        onChange={(value) => {
                          if (userPermissions.canEdit) {
                            const rotation = Array.isArray(value) ? value[0] : value;
                            updateElement(selectedElementData.id, { rotation });
                          }
                        }}
                        minValue={-180}
                        maxValue={180}
                        step={1}
                        className="w-full"
                        isDisabled={!userPermissions.canEdit}
                      />
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* View Mode Info */}
              {(isViewMode || !userPermissions.canEdit) && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">View Mode</h3>
                  </CardHeader>
                  <CardBody className="space-y-2">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {isViewMode ? 
                          "You are in view-only mode. Elements cannot be modified." :
                          "You don't have permission to edit this certificate template."
                        }
                      </p>
                      {!userPermissions.hasPermission && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          To edit certificate templates, you need to be an admin or committee member for this event.
                        </p>
                      )}
                    </div>
                    
                    <div className="text-sm">
                      <p className="font-medium">Template Statistics:</p>
                      <p>Elements: {elements.length}</p>
                      <p>Dimensions: {templateSettings.width}x{templateSettings.height}</p>
                      <p>Aspect Ratio: {templateSettings.aspectRatio}</p>
                      <p>Save Path: {userPermissions.canEdit ? `static/sertifikat/${eventId}/` : "Local only"}</p>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 p-4 overflow-auto bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
            <div 
              ref={canvasRef}
              className="relative border border-gray-300 dark:border-gray-600 shadow-lg bg-white"
              style={{
                width: `${templateSettings.width * templateSettings.scale}px`,
                height: `${templateSettings.height * templateSettings.scale}px`,
                backgroundColor: templateSettings.backgroundColor,
                backgroundImage: templateSettings.backgroundImage ? `url('${templateSettings.backgroundImage}')` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {elements.map(element => (
                <Rnd
                  key={element.id}
                  position={{ 
                    x: element.x * templateSettings.scale, 
                    y: element.y * templateSettings.scale 
                  }}
                  size={{ 
                    width: element.width * templateSettings.scale, 
                    height: element.height * templateSettings.scale 
                  }}
                  onDragStop={(e, d) => {
                    if (!isViewMode && userPermissions.canEdit) {
                      updateElement(element.id, { 
                        x: Math.round(d.x / templateSettings.scale), 
                        y: Math.round(d.y / templateSettings.scale) 
                      });
                    }
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    if (!isViewMode && userPermissions.canEdit) {
                      updateElement(element.id, {
                        width: Math.round(parseInt(ref.style.width) / templateSettings.scale),
                        height: Math.round(parseInt(ref.style.height) / templateSettings.scale),
                        x: Math.round(position.x / templateSettings.scale),
                        y: Math.round(position.y / templateSettings.scale)
                      });
                    }
                  }}
                  bounds="parent"
                  className={`${selectedElement === element.id ? 'ring-2 ring-blue-500' : ''} ${!userPermissions.canEdit ? 'pointer-events-none' : ''}`}
                  onClick={() => {
                    if (!isViewMode && userPermissions.canEdit) {
                      setSelectedElement(element.id);
                    }
                  }}
                  disableDragging={isViewMode || !userPermissions.canEdit}
                  enableResizing={!isViewMode && userPermissions.canEdit}
                >
                  <div
                    className={`w-full h-full flex items-center justify-start p-1 ${(!isViewMode && userPermissions.canEdit) ? 'cursor-move' : 'cursor-default'}`}
                    style={{
                      fontSize: `${element.fontSize * templateSettings.scale}px`,
                      fontFamily: element.fontFamily,
                      fontWeight: element.fontWeight,
                      color: element.color,
                      textAlign: element.textAlign,
                      transform: `rotate(${element.rotation}deg)`,
                      justifyContent: element.textAlign === 'center' ? 'center' : 
                                   element.textAlign === 'right' ? 'flex-end' : 'flex-start',
                      wordWrap: 'break-word',
                      overflow: 'hidden',
                      boxSizing: 'border-box'
                    }}
                  >
                    {getElementDisplayContent(element)}
                  </div>
                </Rnd>
              ))}

              {/* Canvas Guidelines */}
              {(!isViewMode && userPermissions.canEdit) && (
                <div className="absolute inset-0 pointer-events-none">
                  <div 
                    className="absolute border-l border-dashed border-gray-400 opacity-30"
                    style={{ left: '50%', height: '100%' }}
                  />
                  <div 
                    className="absolute border-t border-dashed border-gray-400 opacity-30"
                    style={{ top: '50%', width: '100%' }}
                  />
                </div>
              )}

              {/* No Edit Permission Overlay */}
              {!userPermissions.canEdit && (
                <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center pointer-events-none">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center max-w-sm">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      🔒 View Only Mode
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      You need admin or committee permissions to edit
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Files will be saved to static/sertifikat/{eventId}/
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        <Modal
          isOpen={isPreviewOpen}
          onClose={closePreview}
          size="5xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader>
              <div className="flex justify-between items-center w-full">
                <h3>Certificate Preview</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Participant Name"
                    value={previewData.UserName}
                    onValueChange={(value) => setPreviewData(prev => ({ ...prev, UserName: value }))}
                    size="sm"
                    className="w-48"
                  />
                  <Input
                    placeholder="Event Name"
                    value={previewData.EventName}
                    onValueChange={(value) => setPreviewData(prev => ({ ...prev, EventName: value }))}
                    size="sm"
                    className="w-64"
                  />
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Template will be saved to: <span className="font-mono text-blue-600">static/sertifikat/{eventId}/index.html</span>
                </p>
                <p className="text-sm text-gray-600">
                  Background image: <span className="font-mono text-blue-600">static/sertifikat/{eventId}/bg.png</span>
                </p>
              </div>
              <div className="flex justify-center p-4">
                <div
                  className="border border-gray-300 shadow-lg bg-white"
                  style={{
                    width: templateSettings.width,
                    height: templateSettings.height,
                    backgroundColor: templateSettings.backgroundColor,
                    backgroundImage: templateSettings.backgroundImage ? `url('${templateSettings.backgroundImage}')` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    position: 'relative',
                    transform: `scale(${Math.min(800 / templateSettings.width, 600 / templateSettings.height)})`,
                    transformOrigin: 'top center'
                  }}
                >
                  {elements.map(element => (
                    <div
                      key={element.id}
                      style={{
                        position: 'absolute',
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                        fontSize: element.fontSize,
                        fontFamily: element.fontFamily,
                        fontWeight: element.fontWeight,
                        color: element.color,
                        textAlign: element.textAlign,
                        transform: `rotate(${element.rotation}deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: element.textAlign === 'center' ? 'center' : 
                                      element.textAlign === 'right' ? 'flex-end' : 'flex-start',
                        wordWrap: 'break-word',
                        overflow: 'hidden',
                        boxSizing: 'border-box'
                      }}
                    >
                      {getElementDisplayContent(element)}
                    </div>
                  ))}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={closePreview}>
                Close Preview
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      <ToastContainer />
    </DefaultLayout>
  );
}