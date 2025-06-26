import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import QrScanner from "react-qr-barcode-scanner";

type QRScannerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const QRScanner = ({ isOpen, onClose }: QRScannerProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" placement="center">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-lg font-semibold">Scan Attendance QR Code</h3>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center justify-center">
            <div className="rounded-lg border-2 border-blue-500 border-dashed overflow-hidden w-full max-w-[400px] aspect-square bg-black qr-video-wrapper">
              <QrScanner onUpdate={() => {}} onError={() => {}} />
            </div>
            <p className="text-gray-600 text-sm mt-3">
              Point the camera at the participant's QR code inside the frame.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
      {/* Adjust Camera View (Because it's not full without this style) */}
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
