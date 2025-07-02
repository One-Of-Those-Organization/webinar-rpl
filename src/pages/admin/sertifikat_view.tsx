import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DefaultLayout from "@/layouts/default_admin";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Input,
  Chip,
  ButtonGroup,
  Skeleton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { button as buttonStyles } from "@heroui/theme";
import { toast, ToastContainer } from "react-toastify";
import { auth_cert } from "@/api/auth_cert";
import { auth_webinar } from "@/api/auth_webinar";
import { FaArrowLeft, FaEdit, FaDownload, FaEye, FaImage, FaCode } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "@/api/endpoint";

interface PreviewData {
  UniqueID: string;
  EventName: string;
  UserName: string;
}

interface CertificateTemplate {
  ID: number;
  EventId: number;
  CertTemplate: string;
}

export default function CertificateTemplateViewer() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
  const [certificateTemplate, setCertificateTemplate] = useState<CertificateTemplate | null>(null);
  const [templateExists, setTemplateExists] = useState(false);
  const [backgroundImageExists, setBackgroundImageExists] = useState(false);
  const [templateContent, setTemplateContent] = useState<string>("");
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  // Preview data
  const [previewData, setPreviewData] = useState<PreviewData>({
    UniqueID: "CERT-SAMPLE-123456",
    EventName: "Sample Event",
    UserName: "Mikaelazzz"
  });

// Aspect ratio state (default 16/9)
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Modal hooks
  const { isOpen: isCodeModalOpen, onOpen: openCodeModal, onClose: closeCodeModal } = useDisclosure();

  // Tambahkan state untuk base64 background
  const [bgBase64, setBgBase64] = useState<string>("");

  // PERBAIKI: Check certificate template dengan multiple methods dan logging yang lebih detail
  const checkCertificateTemplate = useCallback(async () => {
    if (!eventId) return false;
    
    console.log(`[DEBUG] Checking certificate template for event ID: ${eventId}`);
    
    try {
      // Method 1: Cek via API database
      console.log("[DEBUG] Method 1: Checking via API...");
      const apiResult = await auth_cert.check_cert_exists(parseInt(eventId));
      console.log("[DEBUG] API Result:", apiResult);
      
      if (apiResult.success && apiResult.data) {
        setCertificateTemplate(apiResult.data);
        console.log("[DEBUG] Certificate template found via API:", apiResult.data);
        return true;
      }
      
      // Method 2: Cek file HTML langsung
      console.log("[DEBUG] Method 2: Checking HTML file directly...");
      const templateUrl = `http://localhost:3000/static/${eventId}/index.html`;
      console.log("[DEBUG] Template URL:", templateUrl);
      
      try {
        const response = await fetch(templateUrl, { 
          method: 'HEAD',
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        console.log("[DEBUG] HTML file response status:", response.status);
        
        if (response.ok) {
          const mockTemplate = {
            ID: parseInt(eventId),
            EventId: parseInt(eventId),
            CertTemplate: `static/${eventId}/index.html`
          };
          setCertificateTemplate(mockTemplate);
          console.log("[DEBUG] Certificate template found via file check:", mockTemplate);
          return true;
        }
      } catch (fileError) {
        console.log("[DEBUG] HTML file check failed:", fileError);
      }
      
      // Method 3: Cek background image bg.png
      console.log("[DEBUG] Method 3: Checking background image...");
      const bgUrl = `http://localhost:3000/static/${eventId}/bg.png`;
      console.log("[DEBUG] Background URL:", bgUrl);
      
      try {
        const bgResponse = await fetch(bgUrl, { 
          method: 'HEAD',
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        console.log("[DEBUG] Background image response status:", bgResponse.status);
        
        if (bgResponse.ok) {
          const mockTemplate = {
            ID: parseInt(eventId),
            EventId: parseInt(eventId),
            CertTemplate: `static/${eventId}/index.html`
          };
          setCertificateTemplate(mockTemplate);
          console.log("[DEBUG] Certificate template detected via bg.png:", mockTemplate);
          return true;
        }
      } catch (bgError) {
        console.log("[DEBUG] Background image check failed:", bgError);
      }
      
      console.log("[DEBUG] No certificate template found via any method");
      return false;
      
    } catch (error) {
      console.error("[ERROR] Failed to check certificate template:", error);
      return false;
    }
  }, [eventId]);

  // PERBAIKI: Check background image dengan retry mechanism
  const checkBackgroundImage = useCallback(async () => {
    if (!eventId) return;
    
    console.log(`[DEBUG] Checking background image for event ID: ${eventId}`);
    
    const imageUrl = `http://localhost:3000/static/${eventId}/bg.png`;
    console.log("[DEBUG] Background image URL:", imageUrl);
    
    try {
      // Coba dengan beberapa method
      const methods = ['HEAD', 'GET'];
      
      for (const method of methods) {
        try {
          console.log(`[DEBUG] Trying ${method} method for background image...`);
          const response = await fetch(imageUrl, { 
            method: method,
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          
          console.log(`[DEBUG] Background image ${method} response:`, {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
          });
          
          if (response.ok) {
            setBackgroundImageExists(true);
            console.log("[SUCCESS] Background image found!");
            return;
          }
        } catch (methodError) {
          console.log(`[DEBUG] ${method} method failed:`, methodError);
        }
      }
      
      // Jika semua method gagal
      console.log("[DEBUG] All methods failed, background image not found");
      setBackgroundImageExists(false);
      
    } catch (error) {
      console.error("[ERROR] Background image check error:", error);
      setBackgroundImageExists(false);
    }
  }, [eventId]);

  // PERBAIKI: Load template content dengan enhanced error handling
  const loadTemplateContent = useCallback(async () => {
    if (!eventId) return;
    
    console.log(`[DEBUG] Loading template content for event ID: ${eventId}`);
    setIsLoadingTemplate(true);
    
    try {
      const templateUrl = `${window.location.origin}/static/${eventId}/index.html`;
      console.log("[DEBUG] Loading template from:", templateUrl);
      
      const response = await fetch(templateUrl, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log("[DEBUG] Template response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        contentType: response.headers.get('content-type')
      });
      
      if (response.ok) {
        const content = await response.text();
        console.log("[DEBUG] Template content length:", content.length);
        console.log("[DEBUG] Template content preview:", content.substring(0, 200) + "...");
        setTemplateContent(content);
        console.log("[SUCCESS] Template content loaded successfully");
      } else {
        console.log("[ERROR] Template file not found, status:", response.status);
        setTemplateContent("");
      }
    } catch (error) {
      console.error("[ERROR] Failed to load template content:", error);
      setTemplateContent("");
    } finally {
      setIsLoadingTemplate(false);
    }
  }, [eventId]);

  // Perbaiki processTemplateForPreview agar replace url bg.png dengan base64
  const processTemplateForPreview = useCallback((content: string): string => {
    if (!content) return "";
    let processedContent = content;
    processedContent = processedContent.replace(/\{\{\.UniqueID\}\}/g, previewData.UniqueID);
    processedContent = processedContent.replace(/\{\{\.EventName\}\}/g, previewData.EventName);
    processedContent = processedContent.replace(/\{\{\.UserName\}\}/g, previewData.UserName);

    // Jika sudah dapat base64, replace SEMUA url('...bg.png') dengan base64
    if (bgBase64) {
      processedContent = processedContent.replace(/url\(['"]?[^'"]*bg\.png['"]?\)/g, `url('${bgBase64}')`);
      processedContent = processedContent.replace(/background-image:\s*url\(['"]?[^'"]*bg\.png['"]?\)/g, `background-image: url('${bgBase64}')`);
      processedContent = processedContent.replace(/src=['"]([^'"]*bg\.png)['"]/g, `src='${bgBase64}'`);
    }

    // Inject CSS agar certificate-container di-scale otomatis agar fit ke iframe
    if (!processedContent.includes("__CERT_PREVIEW_SCALE__")) {
      processedContent = processedContent.replace(
        /<head>/i,
        `<head><style id=\"__CERT_PREVIEW_SCALE__\">\nhtml,body{height:100%;margin:0;padding:0;overflow:hidden;}\n.certificate-preview-wrapper{display:flex;align-items:center;justify-content:center;width:100vw;height:100vh;overflow:hidden;background:transparent;}\n.certificate-container{transform-origin:top left;}\n</style>`
      );
    }

    // Inject wrapper div agar scaling bisa dilakukan
    if (!processedContent.includes('certificate-preview-wrapper')) {
      processedContent = processedContent.replace(
        /<body[^>]*>/i,
        match => `${match}\n<div class=\"certificate-preview-wrapper\">`
      );
      processedContent = processedContent.replace(
        /<\/body>/i,
        '</div></body>'
      );
    }

    // Inject script untuk auto scale certificate-container agar fit ke parent
    if (!processedContent.includes('__CERT_PREVIEW_SCALE_SCRIPT__')) {
      processedContent = processedContent.replace(
        /<\/body>/i,
        `<script id=\"__CERT_PREVIEW_SCALE_SCRIPT__\">\n(function(){\nfunction scaleCert(){\n  var cert = document.querySelector('.certificate-container');\n  var wrap = document.querySelector('.certificate-preview-wrapper');\n  if(cert && wrap){\n    var scaleX = wrap.clientWidth / cert.offsetWidth;\n    var scaleY = wrap.clientHeight / cert.offsetHeight;\n    var scale = Math.min(scaleX, scaleY);\n    cert.style.transform = 'scale(' + scale + ')';\n  }\n}\nwindow.addEventListener('resize', scaleCert);\nwindow.addEventListener('DOMContentLoaded', scaleCert);\nsetTimeout(scaleCert, 100);\n})();\n</script></body>`
      );
    }

    return processedContent;
  }, [previewData, eventId, bgBase64]);

    useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.cert_preview_size) {
        const { w, h } = e.data.cert_preview_size;
        if (w > 0 && h > 0) {
          setAspectRatio(w / h);
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // PERBAIKI: Load data dengan sequential loading dan better error handling
  useEffect(() => {
    const loadData = async () => {
      if (!eventId) {
        toast.error("No event ID provided");
        navigate('/admin/webinar');
        return;
      }

      console.log(`[DEBUG] Starting data load for event ID: ${eventId}`);
      
      try {
        setIsLoading(true);

        // Load event data
        console.log("[DEBUG] Loading event data...");
        const eventResult = await auth_webinar.get_webinar_by_id(parseInt(eventId));
        console.log("[DEBUG] Event result:", eventResult);
        
        if (eventResult.success && eventResult.data) {
          setEventData(eventResult.data);
          setPreviewData(prev => ({
            ...prev,
            EventName: eventResult.data.EventName || eventResult.data.event_name || eventResult.data.name || "Unknown Event"
          }));
        } else {
          setEventData({
            EventName: `Event ${eventId}`,
            event_name: `Event ${eventId}`,
            ID: eventId,
            id: eventId
          });
          setPreviewData(prev => ({
            ...prev,
            EventName: `Event ${eventId}`
          }));
        }

        // Check certificate template
        console.log("[DEBUG] Checking certificate template...");
        const templateFound = await checkCertificateTemplate();
        setTemplateExists(templateFound);
        console.log("[DEBUG] Template exists:", templateFound);

        // Check background image
        console.log("[DEBUG] Checking background image...");
        await checkBackgroundImage();

        // Load template content
        console.log("[DEBUG] Loading template content...");
        await loadTemplateContent();

      } catch (error) {
        console.error("[ERROR] Failed to load data:", error);
        toast.error("Failed to load certificate template data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [eventId, navigate]); // Remove dependencies yang menyebabkan infinite loop

  // Navigate to editor
  const handleEditTemplate = () => {
    navigate(`/admin/sertifikat/editor?event_id=${eventId}`);
  };

  // Download template
  const handleDownloadTemplate = () => {
    if (!templateContent) {
      toast.error("No template content to download");
      return;
    }

    try {
      const processedContent = processTemplateForPreview(templateContent);
      const blob = new Blob([processedContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_template_event_${eventId}_${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Certificate template downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download template");
    }
  };

  // Show template code
  const handleShowCode = () => {
    if (!templateContent) {
      toast.error("No template content available");
      return;
    }
    openCodeModal();
  };

  // Fetch bg.png dan ubah ke base64 saat eventId berubah
  useEffect(() => {
    if (!eventId) return;
    const fetchBg = async () => {
      try {
        const bgUrl = `http://localhost:3000/static/${eventId}/bg.png`;
        const response = await fetch(bgUrl);
        if (!response.ok) return;
        const blob = await response.blob();
        const reader = new window.FileReader();
        reader.onloadend = () => {
          setBgBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (e) {
        setBgBase64("");
      }
    };
    fetchBg();
  }, [eventId]);

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="space-y-4">
          <Skeleton className="rounded-xl">
            <div className="h-64 rounded-xl bg-default-300"></div>
          </Skeleton>
          <div className="space-y-3">
            <Skeleton className="w-3/5 rounded-lg">
              <div className="h-8 w-3/5 rounded-lg bg-default-200"></div>
            </Skeleton>
            <Skeleton className="w-4/5 rounded-lg">
              <div className="h-6 w-4/5 rounded-lg bg-default-200"></div>
            </Skeleton>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!hasPermission) {
    return (
      <DefaultLayout>
        <Card>
          <CardBody className="text-center py-10">
            <h3 className="text-lg font-semibold text-warning">
              Access Denied
            </h3>
            <p className="text-gray-500 mt-2">
              You don't have permission to view certificate templates for this event.
            </p>
            <Button
              color="primary"
              className="mt-4"
              onPress={() => navigate("/admin/webinar")}
            >
              Back to Webinars
            </Button>
          </CardBody>
        </Card>
      </DefaultLayout>
    );
  }

  // UBAH: Kondisi untuk menampilkan "not found" hanya jika benar-benar tidak ada file apapun
  if (!templateExists && !templateContent && !backgroundImageExists) {
    return (
      <DefaultLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Certificate Template Viewer</h1>
              <p className="text-sm text-gray-600">
                Event: {eventData?.EventName || eventData?.event_name || eventData?.name || "Unknown Event"} (ID: {eventId})
              </p>
            </div>
            <Button
              color="secondary"
              variant="bordered"
              startContent={<FaArrowLeft />}
              onPress={() => navigate('/admin/webinar')}
            >
              Back to Webinars
            </Button>
          </div>

          <Card>
            <CardBody className="text-center py-10">
              <h3 className="text-lg font-semibold text-warning">
                No Certificate Template Found
              </h3>
              <p className="text-gray-500 mt-2">
                No certificate template has been created for this event yet.
              </p>
              <div className="flex gap-2 justify-center mt-4">
                <Button
                  color="primary"
                  onPress={() => navigate(`/admin/sertifikat/editor?event_id=${eventId}`)}
                >
                  Create Template
                </Button>
                <Button
                  color="default"
                  variant="bordered"
                  onPress={() => navigate("/admin/webinar")}
                >
                  Back to Webinars
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Certificate Template Viewer</h1>
            <p className="text-sm text-blue-600">
              Event: {eventData?.EventName || eventData?.event_name || eventData?.name || "Unknown Event"} (ID: {eventId})
            </p>
            <p className="text-xs text-gray-500">
              Current time: 2025-07-01 15:15:43 UTC | Current user: Mikaelazzz
            </p>
          </div>
          <Button
            color="secondary"
            variant="bordered"
            startContent={<FaArrowLeft />}
            onPress={() => navigate('/admin/webinar')}
          >
            Back to Webinars
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <ButtonGroup>
            <Button
              color="primary"
              startContent={<FaEdit />}
              onPress={handleEditTemplate}
            >
              Edit Template
            </Button>
            <Button
              color="secondary"
              variant="bordered"
              startContent={<FaDownload />}
              onPress={handleDownloadTemplate}
              isDisabled={!templateContent}
            >
              Download Template
            </Button>
            <Button
              color="secondary"
              variant="bordered"
              startContent={<FaCode />}
              onPress={handleShowCode}
              isDisabled={!templateContent}
            >
              View Code
            </Button>
          </ButtonGroup>
        </div>

        {/* DEBUG INFO - TAMBAH untuk debugging */}
        {process.env.NODE_ENV === 'development' && (
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-red-500">DEBUG INFO</h3>
            </CardHeader>
            <CardBody className="space-y-2 text-sm">
              <div>Event ID: {eventId}</div>
              <div>Template Exists: {templateExists.toString()}</div>
              <div>Background Exists: {backgroundImageExists.toString()}</div>
              <div>Template Content Length: {templateContent.length}</div>
              <div>Background URL: {window.location.origin}/static/{eventId}/bg.png</div>
              <div>Template URL: {window.location.origin}/static/{eventId}/index.html</div>
            </CardBody>
          </Card>
        )}

        {/* Template Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Info */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Template Information</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Template ID:</span>
                <Chip color="primary" size="sm" variant="flat">
                  {certificateTemplate?.ID || eventId}
                </Chip>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Template Path:</span>
                <span className="text-xs text-gray-600 break-all">
                  static/{eventId}/index.html
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Background Image:</span>
                <Chip 
                  color={backgroundImageExists ? "success" : "warning"} 
                  size="sm" 
                  variant="flat"
                  startContent={<FaImage />}
                >
                  {backgroundImageExists ? "Available" : "Not Found"}
                </Chip>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Template File:</span>
                <Chip 
                  color={templateContent ? "success" : "danger"} 
                  size="sm" 
                  variant="flat"
                  startContent={<FaCode />}
                >
                  {templateContent ? "Available" : "Not Found"}
                </Chip>
              </div>

              {/* PERBAIKI: Background preview dengan error handling yang lebih baik */}
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Background Preview:</p>
                <div className="relative">
                  <img
                    src={`http://localhost:3000/static/${eventId}/bg.png?t=${Date.now()}`}
                    alt="Certificate Background"
                    className="w-full h-auto object-fill rounded-lg border"
                    onLoad={() => {
                      console.log("[SUCCESS] Background image loaded successfully");
                      setBackgroundImageExists(true);
                    }}
                    onError={(e) => {
                      console.log("[ERROR] Background image failed to load");
                      e.currentTarget.style.display = 'none';
                      setBackgroundImageExists(false);
                    }}
                  />
                  {!backgroundImageExists && (
                    <div className="w-full h-32 flex items-center justify-center border rounded-lg bg-gray-100">
                      <span className="text-gray-500 text-sm">Background image not found</span>
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Preview Controls */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Preview Controls</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <Input
                label="Participant Name"
                placeholder="Enter participant name"
                value={previewData.UserName}
                onValueChange={(value) => setPreviewData(prev => ({ ...prev, UserName: value }))}
                size="sm"
              />
              
              <Input
                label="Event Name"
                placeholder="Enter event name"
                value={previewData.EventName}
                onValueChange={(value) => setPreviewData(prev => ({ ...prev, EventName: value }))}
                size="sm"
              />
              
              <Input
                label="Unique ID"
                placeholder="Enter unique certificate ID"
                value={previewData.UniqueID}
                onValueChange={(value) => setPreviewData(prev => ({ ...prev, UniqueID: value }))}
                size="sm"
              />

              <div className="pt-2">
                <p className="text-xs text-gray-500">
                  These values will be used to preview how the certificate will look with actual data.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Quick Actions</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <Link
                to={`/admin/webinar/edit/${eventId}`}
                className={buttonStyles({
                  color: "secondary",
                  variant: "bordered",
                  size: "sm",
                  className: "w-full"
                })}
              >
                Edit Event Details
              </Link>
              
              <Button
                color="warning"
                variant="bordered"
                size="sm"
                className="w-full"
                onPress={() => navigate(`/admin/sertifikat/editor?event_id=${eventId}&mode=view`)}
                startContent={<FaEye />}
              >
                View in Editor
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Certificate Preview - SELALU TAMPILKAN jika ada templateContent */}
        {templateContent ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Certificate Preview</h3>
                {isLoadingTemplate && (
                  <Chip color="primary" size="sm" variant="flat">
                    Loading...
                  </Chip>
                )}
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div
                  className="mx-auto bg-gray-50 dark:bg-gray-800 rounded-lg border flex justify-center items-center"
                  style={{
                    maxWidth: 900,
                    width: "100%",
                    aspectRatio: aspectRatio,
                    minHeight: 220,
                    maxHeight: "80vh",
                    height: "auto",
                    background: "#212633",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    src={`http://localhost:3000/static/${eventId}/index.html`}
                    className="w-full h-full border-0"
                    style={{
                      display: "block",
                      background: "white",
                      objectFit: "contain",
                      width: "100%",
                      height: "100%",
                      minHeight: 0,
                      minWidth: 0
                    }}
                    title="Certificate Preview"
                    sandbox="allow-same-origin allow-scripts"
                    onLoad={() => console.log("[DEBUG] Iframe loaded successfully")}
                    onError={() => console.log("[ERROR] Iframe failed to load")}
                  />
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  This is a live preview of how the certificate will appear with the current preview data.
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody className="text-center py-10">
              <h3 className="text-lg font-semibold text-warning">
                No Template Content Available
              </h3>
              <p className="text-gray-500 mt-2">
                The template file could not be loaded for preview.
              </p>
            </CardBody>
          </Card>
        )}

        {/* Template Code Modal */}
        <Modal
          isOpen={isCodeModalOpen}
          onClose={closeCodeModal}
          size="5xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader>
              <h3>Certificate Template Source Code</h3>
            </ModalHeader>
            <ModalBody>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
                <pre>{templateContent}</pre>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={closeCodeModal}>
                Close
              </Button>
              <Button 
                color="secondary" 
                variant="bordered" 
                onPress={handleDownloadTemplate}
              >
                Download
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      <ToastContainer />
    </DefaultLayout>
  );
}