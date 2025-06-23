import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "@heroui/react";
import { toast } from "react-toastify";
import QRCode from "qrcode";
import { auth_participants } from "@/api/auth_participants";

interface QRCodeDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  webinarId: number;
  webinarName: string;
}

export function QRCodeDisplay({ isOpen, onClose, webinarId, webinarName }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [participantData, setParticipantData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen && webinarId) {
      generateQRCode();
    }
  }, [isOpen, webinarId]);

  const generateQRCode = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Get participant data from backend
      const result = await auth_participants.get_qr_code_data(webinarId);
      
      if (result.success && result.data) {
        setParticipantData(result.data);
        
        // Create QR code data object
        const qrData = {
          eventId: webinarId,
          eventName: webinarName,
          participantCode: result.data.EventPCode,
          participantRole: result.data.EventPRole,
          userId: result.data.UserId,
          timestamp: "2025-06-23T08:39:40.000Z",
          // Add additional data for verification
          checksum: generateChecksum(result.data.EventPCode, webinarId)
        };
        
        console.log("🔍 QR Code data:", qrData);
        
        // Generate QR code
        const qrCodeDataString = JSON.stringify(qrData);
        const qrCodeDataUrl = await QRCode.toDataURL(qrCodeDataString, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrCodeUrl(qrCodeDataUrl);
        
      } else {
        setError("Failed to get participant data for QR code generation");
        toast.error("Failed to generate QR code");
      }
    } catch (error) {
      console.error("QR code generation error:", error);
      setError("Failed to generate QR code");
      toast.error("Failed to generate QR code");
    } finally {
      setIsLoading(false);
    }
  };

  const generateChecksum = (code: string, eventId: number): string => {
    // Simple checksum for verification
    const data = `${code}-${eventId}-webinar-checkin`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  };

  const handleCopyCode = () => {
    if (participantData?.EventPCode) {
      navigator.clipboard.writeText(participantData.EventPCode);
      toast.success("Participant code copied to clipboard!");
    }
  };

  const handleRefresh = () => {
    generateQRCode();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
      placement="center"
      closeButton
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">👤 Your Check-in QR Code</h3>
            <p className="text-sm text-gray-600">{webinarName}</p>
          </div>
        </ModalHeader>
        <ModalBody>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-600">Generating your QR code...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button color="primary" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          ) : qrCodeUrl ? (
            <div className="flex flex-col items-center">
              {/* QR Code Image */}
              <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <img 
                  src={qrCodeUrl} 
                  alt="Check-in QR Code" 
                  className="w-64 h-64 object-contain"
                />
              </div>
              
              {/* Participant Information */}
              {participantData && (
                <div className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2">Your Participant Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Role:</span>
                      <span className="ml-2 capitalize">{participantData.EventPRole}</span>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className="ml-2">{participantData.EventPCome ? "✅ Attended" : "⏳ Pending"}</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-xs text-gray-500">
                        Current Time: 2025-06-23 08:39:40 UTC
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Instructions */}
              <div className="w-full text-center text-sm text-gray-600">
                <p className="mb-2">
                  <strong>How to check in:</strong>
                </p>
                <ol className="text-left space-y-1">
                  <li>1. Show this QR code to the committee member</li>
                  <li>2. Wait for them to scan your code</li>
                  <li>3. Your attendance will be automatically recorded</li>
                  <li>4. Keep this screen open until scan is complete</li>
                </ol>
              </div>
              
              {/* Refresh Button */}
              <div className="mt-4">
                <Button
                  color="secondary"
                  variant="bordered"
                  size="sm"
                  onClick={handleRefresh}
                >
                  🔄 Refresh QR Code
                </Button>
              </div>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}