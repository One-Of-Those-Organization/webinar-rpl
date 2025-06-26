import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "@heroui/react";
import { QRCodeSVG } from "qrcode.react";
import { auth_participants } from "@/api/auth_participants";

type QRGeneratorProps = {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
};

export function QRGenerator({ isOpen, onClose, eventId }: QRGeneratorProps) {
  const [qrValue, setQrValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !eventId) return;
    setLoading(true);
    auth_participants
      .event_participate_info(eventId)
      .then((response) => {
        const code = response?.data?.EventPCode;
        if (response.success && code) {
          setQrValue(JSON.stringify({ id: eventId, code }));
        } else {
          setQrValue("No code found");
        }
      })
      .catch(() => setQrValue("Cannot connect"))
      .finally(() => setLoading(false));
  }, [isOpen, eventId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" placement="center">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-lg font-semibold">Attendance QR Code</h3>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center gap-3">
            {loading ? (
              <Spinner size="lg" />
            ) : (
              <>
                <QRCodeSVG
                  value={qrValue}
                  size={240}
                  bgColor="#fff"
                  fgColor="#18181b"
                  level="M"
                  includeMargin={true}
                />
                <p className="text-gray-600 text-sm text-center mt-2">
                  Show this QR to the committee to be scanned during attendance.
                </p>
              </>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onClick={onClose}>
            Tutup
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
