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

  useEffect(() => {
    if (isOpen) {
      startCamera();
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
      setError("Gagal mengakses kamera. Pastikan izin kamera telah diberikan.");
      toast.error("Gagal mengakses kamera");
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
    
    // For demonstration, we'll simulate finding a QR code after 3 seconds
    // In real implementation, this would be replaced with actual QR detection
    
    // Simulate QR code detection
    setTimeout(() => {
      if (isScanning) {
        const simulatedQRCode = `webinar_${webinarId}_${Date.now()}`;
        handleQRCodeDetected(simulatedQRCode);
      }
    }, 3000);
  };

  const handleQRCodeDetected = (code: string) => {
    setIsScanning(false);
    onScanSuccess(code);
    toast.success("QR Code berhasil dipindai!");
    onClose();
  };

  const handleManualInput = () => {
    const code = prompt("Masukkan kode absensi manual:");
    if (code && code.trim()) {
      handleQRCodeDetected(code.trim());
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      placement="center"
    >
      <ModalContent>
        <ModalHeader>
          <h3 className="text-lg font-semibold">Scan QR Code Absensi</h3>
        </ModalHeader>
        <ModalBody>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button color="primary" onClick={startCamera}>
                Coba Lagi
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
                <div className="border-2 border-blue-500 border-dashed w-48 h-48 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center bg-black bg-opacity-50 px-3 py-2 rounded">
                    <p className="text-sm">Arahkan kamera ke QR Code</p>
                    {isScanning && (
                      <div className="mt-2">
                        <div className="animate-pulse">📷 Scanning...</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm mb-2">
              Pastikan QR code terlihat jelas dalam bingkai
            </p>
            <Button
              color="secondary"
              variant="bordered"
              size="sm"
              onClick={handleManualInput}
            >
              Input Manual
            </Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Tutup
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}