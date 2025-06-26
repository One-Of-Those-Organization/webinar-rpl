import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { toast } from "react-toastify";
import { EventPartisipantAbsence } from "@/api/interface";
import { auth_participants } from "@/api/auth_participants";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "@heroui/react";

type QRScannerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function QRScanner({ isOpen, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const scanIdRef = useRef<number | null>(null);

  // Helper untuk mematikan kamera
  const closeCamera = () => {
    if (scanIdRef.current) cancelAnimationFrame(scanIdRef.current);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => {
    let active = true;

    const startCamera = async () => {
      setCameraError(null);
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (!active) {
          localStream.getTracks().forEach((track) => track.stop());
          return;
        }
        setStream(localStream);
        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
          videoRef.current.setAttribute("playsinline", "true");
          await videoRef.current.play();
        }
        scan();
      } catch (err) {
        setCameraError("Camera access denied or unavailable.");
      }
    };

    const scan = () => {
      if (!videoRef.current || !canvasRef.current || isSubmitting) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code?.data) {
        handleResult(code.data);
        return;
      }
      scanIdRef.current = requestAnimationFrame(scan);
    };

    if (isOpen) startCamera();

    return () => {
      active = false;
      closeCamera();
      setStream(null);
    };
    // eslint-disable-next-line
  }, [isOpen, isSubmitting]);

  const handleResult = async (raw: string) => {
    setIsSubmitting(true);
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      toast.error("QR Code format invalid.");
      setIsSubmitting(false);
      closeCamera();
      return;
    }
    if (!data.id || !data.code) {
      toast.error("QR Code missing required fields.");
      setIsSubmitting(false);
      closeCamera();
      return;
    }

    try {
      const response = await auth_participants.event_participate_absence({
        id: data.id,
        code: data.code,
      } as EventPartisipantAbsence);
      if (response.success) {
        toast.success("Attendance marked successfully!");
        setTimeout(() => {
          onClose();
          closeCamera();
        }, 800);
        closeCamera();
      } else {
        toast.error("Failed to mark attendance. Please try again.", {
          toastId: "attendance-error",
        });
        setIsSubmitting(false);
        closeCamera();
      }
    } catch (error) {
      toast.error("Failed to scan QR code. Please try again.");
      setIsSubmitting(false);
      closeCamera();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        closeCamera();
      }}
      size="2xl"
      placement="center"
    >
      <ModalContent>
        <ModalHeader>
          <h3 className="text-lg font-semibold">Scan Attendance QR Code</h3>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center justify-center">
            <div className="rounded-lg border-2 border-blue-500 border-dashed overflow-hidden w-full max-w-[400px] aspect-square bg-black qr-video-wrapper relative">
              {!isSubmitting && (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  autoPlay
                />
              )}
              <canvas ref={canvasRef} style={{ display: "none" }} />
              {isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <Spinner color="primary" size="lg" />
                  <span className="ml-2 text-white font-semibold">
                    Sending timesheets...
                  </span>
                </div>
              )}
            </div>
            <p className="text-gray-600 text-sm mt-3 text-center">
              Point the camera at the participant's QR code in the frame.
            </p>
            {cameraError && (
              <div className="text-red-600 mt-3 text-center">{cameraError}</div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onClick={() => {
              onClose();
              closeCamera();
            }}
            disabled={isSubmitting}
          >
            Tutup
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
}
