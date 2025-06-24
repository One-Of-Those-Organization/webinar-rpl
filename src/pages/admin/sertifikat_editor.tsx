import React, { useState, useRef, useCallback, useEffect } from "react";
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
  Switch,
  Divider,
  Chip,
  ButtonGroup,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { toast, ToastContainer } from "react-toastify";
import { Rnd } from "react-rnd";
import { auth_certificate } from "@/api/auth_certificate";

// Types
interface TextElement {
  id: string;
  type: 'text' | 'dynamic';
  content: string;
  dynamicField?: 'UniqID' | 'Event' | 'Name';
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
}

const ASPECT_RATIOS = {
  '4:3': { width: 800, height: 600 },
  '16:9': { width: 1920, height: 1080 }
};

const DYNAMIC_FIELDS = [
  { key: 'UniqID', label: 'Unique ID', description: 'Participant unique identifier' },
  { key: 'Event', label: 'Event Name', description: 'Name of the webinar/event' },
  { key: 'Name', label: 'Participant Name', description: 'Full name of participant' }
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

export default function CertificateEditor() {
  // State management
  const [elements, setElements] = useState<TextElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>({
    aspectRatio: '4:3',
    backgroundColor: '#ffffff',
    width: ASPECT_RATIOS['4:3'].width,
    height: ASPECT_RATIOS['4:3'].height
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Preview data
  const [previewData, setPreviewData] = useState({
    UniqID: "CERT123456789",
    Event: "Advanced Web Development Workshop 2025",
    Name: "Mikaelazzz"
  });

  // Refs and modal hooks
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOpen: isPreviewOpen, onOpen: openPreview, onClose: closePreview } = useDisclosure();

  // Update template dimensions when aspect ratio changes
  useEffect(() => {
    const newDimensions = ASPECT_RATIOS[templateSettings.aspectRatio];
    setTemplateSettings(prev => ({
      ...prev,
      width: newDimensions.width,
      height: newDimensions.height
    }));
  }, [templateSettings.aspectRatio]);

  // Generate unique ID for elements
  const generateId = () => `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add new text element
  const addTextElement = useCallback((type: 'text' | 'dynamic', dynamicField?: string) => {
    const newElement: TextElement = {
      id: generateId(),
      type,
      content: type === 'text' ? 'Sample Text' : `{{${dynamicField}}}`,
      dynamicField: dynamicField as any,
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      fontSize: 24,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#000000',
      textAlign: 'left',
      rotation: 0
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
  }, []);

  // Update element properties
  const updateElement = useCallback((id: string, updates: Partial<TextElement>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  }, []);

  // Delete element
  const deleteElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  // Handle background image upload
  const handleBackgroundUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setTemplateSettings(prev => ({
          ...prev,
          backgroundImage: e.target?.result as string
        }));
        toast.success("Background image uploaded successfully");
      };
      reader.onerror = () => {
        toast.error("Failed to read image file");
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Get display content for elements
  const getElementDisplayContent = useCallback((element: TextElement) => {
    if (element.type === 'dynamic' && element.dynamicField) {
      return previewData[element.dynamicField] || `{{${element.dynamicField}}}`;
    }
    return element.content;
  }, [previewData]);

  // Generate HTML template
  const generateHTMLTemplate = useCallback(() => {
    const htmlElements = elements.map(element => {
      return `        <div style="
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
          overflow: hidden;
        ">
          ${element.type === 'dynamic' && element.dynamicField 
            ? `{{.${element.dynamicField}}}` 
            : element.content
          }
        </div>`;
    }).join('\n');

    return `<!DOCTYPE html>
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
            ${templateSettings.backgroundImage ? `background-image: url('@@');` : ''}
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            overflow: hidden;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
${htmlElements}
    </div>
</body>
</html>`;
  }, [elements, templateSettings]);

  // Create default PNG image if no background provided
  const createDefaultBackgroundImage = useCallback(() => {
    return new Promise<string>((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = templateSettings.width;
      canvas.height = templateSettings.height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Fill with background color
        ctx.fillStyle = templateSettings.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add a subtle border
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
      }
      
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    });
  }, [templateSettings.backgroundColor, templateSettings.width, templateSettings.height]);

  // Convert any image to PNG format
  const convertImageToPNG = useCallback((imageDataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Convert to PNG
        const pngDataUrl = canvas.toDataURL('image/png', 1.0);
        resolve(pngDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageDataUrl;
    });
  }, []);

  // Save template
  const saveTemplate = useCallback(async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    if (elements.length === 0) {
      toast.error("Please add at least one element to the template");
      return;
    }

    setIsSaving(true);
    try {
      console.log("🔍 Starting template save process...");
      
      // Generate HTML content
      const htmlContent = generateHTMLTemplate();
      console.log("🔍 Generated HTML content:", htmlContent.substring(0, 200) + "...");
      
      // Prepare image data - always create a PNG background
      let finalImageDataUrl: string;
      
      if (templateSettings.backgroundImage) {
        console.log("🔍 Converting user background image to PNG...");
        finalImageDataUrl = await convertImageToPNG(templateSettings.backgroundImage);
      } else {
        console.log("🔍 Creating default background image...");
        finalImageDataUrl = await createDefaultBackgroundImage();
      }
      
      console.log("🔍 Image preparation complete");
      
      // Prepare payload
      const payload = {
        event_name: templateName.trim(),
        data_html: htmlContent, // Send raw HTML
        data_img: finalImageDataUrl  // Send complete data URL
      };

      console.log("🔍 Sending payload:", {
        event_name: payload.event_name,
        data_html_length: payload.data_html.length,
        data_img_length: payload.data_img.length,
        data_html_preview: payload.data_html.substring(0, 100),
        data_img_preview: payload.data_img.substring(0, 50)
      });

      const result = await auth_certificate.uploadTemplate(payload);

      if (result.success) {
        toast.success("Template saved successfully!");
        console.log("🔍 Template saved successfully:", result.data);
        
        // Reset form
        setTemplateName("");
        setElements([]);
        setSelectedElement(null);
        setTemplateSettings({
          aspectRatio: '4:3',
          backgroundColor: '#ffffff',
          width: ASPECT_RATIOS['4:3'].width,
          height: ASPECT_RATIOS['4:3'].height
        });
      } else {
        console.error("🔍 Save failed:", result);
        toast.error(result.message || "Failed to save template");
      }
    } catch (error) {
      console.error("🔍 Save template error:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  }, [templateName, elements, generateHTMLTemplate, templateSettings, convertImageToPNG, createDefaultBackgroundImage]);

  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  return (
    <DefaultLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Certificate Editor</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Current time: 2025-06-23 12:30:33 UTC | User: Mikaelazzz
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Template name..."
                value={templateName}
                onValueChange={setTemplateName}
                className="w-64"
                size="sm"
                maxLength={50}
              />
              <ButtonGroup size="sm">
                <Button
                  color="secondary"
                  variant="bordered"
                  onClick={openPreview}
                  isDisabled={elements.length === 0}
                >
                  Preview
                </Button>
                <Button
                  color="primary"
                  onClick={saveTemplate}
                  isLoading={isSaving}
                  isDisabled={!templateName.trim() || elements.length === 0}
                >
                  Save Template
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Tools */}
          <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Template Settings */}
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
                      className="w-full"
                    >
                      Upload Background Image
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supports: JPG, PNG, GIF (max 5MB)
                    </p>
                    {templateSettings.backgroundImage && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onClick={() => setTemplateSettings(prev => ({ 
                            ...prev, 
                            backgroundImage: undefined 
                          }))}
                        >
                          Remove Background
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Template Info */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                      Template Info
                    </h4>
                    <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                      <p>Elements: {elements.length}</p>
                      <p>Canvas: {templateSettings.width}x{templateSettings.height}</p>
                      <p>Background: {templateSettings.backgroundImage ? 'Custom Image' : 'Color Only'}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Add Elements */}
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
                      >
                        🔗 {field.label}
                      </Button>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Element Properties */}
              {selectedElementData && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Element Properties</h3>
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        onClick={() => deleteElement(selectedElementData.id)}
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
                        maxLength={100}
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
                        min="0"
                        max={templateSettings.width}
                      />
                      <Input
                        label="Y Position"
                        type="number"
                        value={selectedElementData.y.toString()}
                        onValueChange={(value) => updateElement(selectedElementData.id, { y: parseInt(value) || 0 })}
                        size="sm"
                        min="0"
                        max={templateSettings.height}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Width"
                        type="number"
                        value={selectedElementData.width.toString()}
                        onValueChange={(value) => updateElement(selectedElementData.id, { width: parseInt(value) || 0 })}
                        size="sm"
                        min="10"
                        max={templateSettings.width}
                      />
                      <Input
                        label="Height"
                        type="number"
                        value={selectedElementData.height.toString()}
                        onValueChange={(value) => updateElement(selectedElementData.id, { height: parseInt(value) || 0 })}
                        size="sm"
                        min="10"
                        max={templateSettings.height}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Font Size: {selectedElementData.fontSize}px</label>
                      <Slider
                        value={[selectedElementData.fontSize]}
                        onChange={(value) => {
                          const fontSize = Array.isArray(value) ? value[0] : value;
                          updateElement(selectedElementData.id, { fontSize });
                        }}
                        minValue={8}
                        maxValue={120}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <Select
                      label="Font Family"
                      selectedKeys={[selectedElementData.fontFamily]}
                      onSelectionChange={(keys) => {
                        const font = Array.from(keys)[0] as string;
                        updateElement(selectedElementData.id, { fontFamily: font });
                      }}
                      size="sm"
                    >
                      {FONT_FAMILIES.map(font => (
                        <SelectItem key={font}>{font}</SelectItem>
                      ))}
                    </Select>

                    <Select
                      label="Font Weight"
                      selectedKeys={[selectedElementData.fontWeight]}
                      onSelectionChange={(keys) => {
                        const weight = Array.from(keys)[0] as string;
                        updateElement(selectedElementData.id, { fontWeight: weight });
                      }}
                      size="sm"
                    >
                      {FONT_WEIGHTS.map(weight => (
                        <SelectItem key={weight.key}>{weight.label}</SelectItem>
                      ))}
                    </Select>

                    <Select
                      label="Text Align"
                      selectedKeys={[selectedElementData.textAlign]}
                      onSelectionChange={(keys) => {
                        const align = Array.from(keys)[0] as 'left' | 'center' | 'right';
                        updateElement(selectedElementData.id, { textAlign: align });
                      }}
                      size="sm"
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
                        onChange={(e) => updateElement(selectedElementData.id, { color: e.target.value })}
                        className="w-full h-10 rounded-lg border cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Rotation: {selectedElementData.rotation}°</label>
                      <Slider
                        value={[selectedElementData.rotation]}
                        onChange={(value) => {
                          const rotation = Array.isArray(value) ? value[0] : value;
                          updateElement(selectedElementData.id, { rotation });
                        }}
                        minValue={-180}
                        maxValue={180}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 p-8 overflow-auto bg-gray-100 dark:bg-gray-900">
            <div className="flex justify-center">
              <div
                ref={canvasRef}
                className="relative border border-gray-300 dark:border-gray-600 shadow-lg"
                style={{
                  width: templateSettings.width / 2, // Scale down for editing
                  height: templateSettings.height / 2,
                  backgroundColor: templateSettings.backgroundColor,
                  backgroundImage: templateSettings.backgroundImage ? `url(${templateSettings.backgroundImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  transform: 'scale(0.8)',
                  transformOrigin: 'top center'
                }}
              >
                {elements.map(element => (
                  <Rnd
                    key={element.id}
                    position={{ x: element.x / 2, y: element.y / 2 }} // Scale position
                    size={{ width: element.width / 2, height: element.height / 2 }} // Scale size
                    onDragStop={(e, d) => {
                      updateElement(element.id, { x: d.x * 2, y: d.y * 2 }); // Scale back up
                    }}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      updateElement(element.id, {
                        width: parseInt(ref.style.width) * 2, // Scale back up
                        height: parseInt(ref.style.height) * 2,
                        x: position.x * 2,
                        y: position.y * 2
                      });
                    }}
                    bounds="parent"
                    className={`${selectedElement === element.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    <div
                      className="w-full h-full flex items-center justify-start p-1 cursor-move"
                      style={{
                        fontSize: element.fontSize / 2, // Scale font
                        fontFamily: element.fontFamily,
                        fontWeight: element.fontWeight,
                        color: element.color,
                        textAlign: element.textAlign,
                        transform: `rotate(${element.rotation}deg)`,
                        justifyContent: element.textAlign === 'center' ? 'center' : 
                                     element.textAlign === 'right' ? 'flex-end' : 'flex-start',
                        wordWrap: 'break-word',
                        overflow: 'hidden'
                      }}
                    >
                      {getElementDisplayContent(element)}
                    </div>
                  </Rnd>
                ))}

                {/* Canvas Guidelines */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Center lines */}
                  <div 
                    className="absolute border-l border-dashed border-gray-400 opacity-30"
                    style={{ left: '50%', height: '100%' }}
                  />
                  <div 
                    className="absolute border-t border-dashed border-gray-400 opacity-30"
                    style={{ top: '50%', width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Canvas Info */}
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Canvas: {templateSettings.width} x {templateSettings.height} ({templateSettings.aspectRatio})
              {elements.length > 0 && (
                <span className="ml-4">
                  Elements: {elements.length} | Selected: {selectedElement ? '1' : '0'}
                </span>
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
                    value={previewData.Name}
                    onValueChange={(value) => setPreviewData(prev => ({ ...prev, Name: value }))}
                    size="sm"
                    className="w-48"
                  />
                  <Input
                    placeholder="Event Name"
                    value={previewData.Event}
                    onValueChange={(value) => setPreviewData(prev => ({ ...prev, Event: value }))}
                    size="sm"
                    className="w-64"
                  />
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="flex justify-center p-4">
                <div
                  className="border border-gray-300 shadow-lg"
                  style={{
                    width: Math.min(templateSettings.width, 800),
                    height: Math.min(templateSettings.height, 600),
                    backgroundColor: templateSettings.backgroundColor,
                    backgroundImage: templateSettings.backgroundImage ? `url(${templateSettings.backgroundImage})` : undefined,
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
                        overflow: 'hidden'
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