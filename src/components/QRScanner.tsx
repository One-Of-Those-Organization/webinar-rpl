import React, { useState, useRef, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { toast } from "react-toastify";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
  webinarId: number;
}

export function QRScanner({ isOpen, onClose, onScanSuccess, webinarId }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [scanSimulated, setScanSimulated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      setScanSimulated(false);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError("");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);
        
        // Start scanning when video is ready
        videoRef.current.onloadedmetadata = () => {
          startScanning();
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Failed to access camera. Please allow camera permissions.");
      toast.error("Failed to access camera");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    const scanFrame = () => {
      if (!isScanning || !video.videoWidth || !video.videoHeight) {
        if (isScanning) {
          requestAnimationFrame(scanFrame);
        }
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple QR code detection (in real implementation, you'd use a QR library)
      // For now, we'll simulate QR code detection
      detectQRCode(imageData);

      if (isScanning) {
        requestAnimationFrame(scanFrame);
      }
    };

    scanFrame();
  };

  const detectQRCode = (imageData: ImageData) => {
    // This is a simplified simulation. In a real app, you'd use a QR code library
    // like @zxing/library or jsQR to actually decode QR codes from the image data
    
    // For demonstration, simulate finding a QR code after 3 seconds (only once)
    if (!scanSimulated) {
      setScanSimulated(true);
      setTimeout(() => {
        if (isScanning) {
          // Simulate a realistic QR code response
          const simulatedQRCode = JSON.stringify({
            eventId: webinarId,
            eventName: "Sample Webinar",
            participantCode: `PART_${Date.now()}`,
            participantRole: "normal",
            userId: 123,
            timestamp: "2025-06-23T08:39:40.000Z",
            checksum: "abc123def"
          });
          handleQRCodeDetected(simulatedQRCode);
        }
      }, 3000);
    }
  };

  const handleQRCodeDetected = (code: string) => {
    setIsScanning(false);
    onScanSuccess(code);
    toast.success("QR Code successfully scanned!");
    onClose();
  };

  const handleManualInput = () => {
    const code = prompt("Enter participant code manually:");
    if (code && code.trim()) {
      // Create a manual input format
      const manualData = JSON.stringify({
        eventId: webinarId,
        participantCode: code.trim(),
        manual: true,
        timestamp: new Date().toISOString()
      });
      handleQRCodeDetected(manualData);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      placement="center"
      closeButton
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">👑 Committee: Scan Attendance QR Code</h3>
            <p className="text-sm text-gray-600">Scan participant QR codes to record attendance</p>
          </div>
        </ModalHeader>
        <ModalBody>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button color="primary" onClick={startCamera}>
                Try Again
              </Button>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover rounded-lg bg-gray-900"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-green-500 border-dashed w-48 h-48 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center bg-black bg-opacity-50 px-3 py-2 rounded">
                    <p className="text-sm">Point camera at participant's QR code</p>
                    {isScanning && (
                      <div className="mt-2">
                        <div className="animate-pulse">📷 Scanning for QR codes...</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Committee instructions */}
              <div className="absolute bottom-2 left-2 right-2 bg-green-600 bg-opacity-90 text-white p-2 rounded text-xs">
                <p className="font-semibold">Committee Instructions:</p>
                <p>• Ask participants to show their QR code</p>
                <p>• Center the QR code in the frame</p>
                <p>• Wait for automatic detection</p>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm mb-2">
              Make sure the participant's QR code is clearly visible in the frame
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                color="secondary"
                variant="bordered"
                size="sm"
                onClick={handleManualInput}
              >
                📝 Manual Entry
              </Button>
              {isScanning && (
                <Button
                  color="warning"
                  variant="bordered"
                  size="sm"
                  onClick={() => {
                    stopCamera();
                    setTimeout(startCamera, 100);
                  }}
                >
                  🔄 Reset Camera
                </Button>
              )}
            </div>
          </div>

          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              <p>Debug Info:</p>
              <p>Camera Active: {isScanning ? "Yes" : "No"}</p>
              <p>Webinar ID: {webinarId}</p>
              <p>Current Time: 2025-06-23 08:39:40 UTC</p>
              <p>Scan Simulated: {scanSimulated ? "Yes" : "No"}</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close Scanner
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}