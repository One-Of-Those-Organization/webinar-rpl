import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import QrScanner from "react-qr-barcode-scanner";
import { EventPartisipantAbsence } from "@/api/interface";
import { auth_participants } from "@/api/auth_participants";
import { toast } from "react-toastify";

type QRScannerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const scanAttendance = async (
  data: EventPartisipantAbsence,
  onSuccess: () => void,
  onError: (error: string) => void
) => {
  try {
    const response = await auth_participants.event_participate_absence(data);
    if (response.success) {
      toast.success("Attendance marked successfully!");
      onSuccess();
    } else {
      onError("Failed to mark attendance. Please try again.");
    }
  } catch (error) {
    onError("Failed to scan QR code. Please try again.");
  }
};

export const QRScanner = ({ isOpen, onClose }: QRScannerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanned, setScanned] = useState(false);

  // Reset state if modal closed/opened
  useEffect(() => {
    if (!isOpen) setScanned(false);
  }, [isOpen]);

  const handleScan = (result: any) => {
    if (scanned || isSubmitting) return; // Prevent double submit
    if (!result?.text) return;

    let data;
    try {
      data = JSON.parse(result.text); // QR code is JSON string
    } catch {
      toast.error("QR Code format invalid.");
      return;
    }

    if (!data.id || !data.code) {
      toast.error("QR Code missing required fields.");
      return;
    }

    setScanned(true);
    setIsSubmitting(true);
    scanAttendance(
      { id: data.id, code: data.code },
      () => {
        setIsSubmitting(false);
        setScanned(false);
        onClose();
      },
      (error: string) => {
        setIsSubmitting(false);
        setScanned(false);
        toast.error(error);
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" placement="center">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-lg font-semibold">Scan Attendance QR Code</h3>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center justify-center">
            <div className="rounded-lg border-2 border-blue-500 border-dashed overflow-hidden w-full max-w-[400px] aspect-square bg-black qr-video-wrapper">
              {!isSubmitting && <QrScanner onUpdate={handleScan} />}
              {isSubmitting && (
                <div className="flex items-center justify-center w-full h-full text-white">
                  Marking Attendance...
                </div>
              )}
            </div>
            <p className="text-gray-600 text-sm mt-3">
              Point the camera at the participant's QR code inside the frame.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
      <style>
        {`
          .qr-video-wrapper video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            display: block;
          }
        `}
      </style>
    </Modal>
  );
};
