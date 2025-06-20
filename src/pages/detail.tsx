import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import DefaultLayout from "@/layouts/default";
import { Image, Button, Spinner } from "@heroui/react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth_webinar } from "@/api/auth_webinar";
import { auth_participants } from "@/api/auth_participants";
import { Webinar } from "@/api/interface";
import { toast, ToastContainer } from "react-toastify";
import { QRScanner } from "@/components/QRScanner";

// Webinar Detail Page

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasAttended, setHasAttended] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

  useEffect(() => {
    async function loadWebinarDetail() {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await auth_webinar.get_webinar_by_id(parseInt(id));

        if (result.success && result.data) {
          const webinarData = Webinar.fromApiResponse(result.data);
          setWebinar(webinarData);

          // Check registration status dari API
          await checkRegistrationStatus(parseInt(id));
        } else {
          toast.error(result.message || "Failed to load webinar details");
        }
      } catch (error) {
        toast.error("Failed to load webinar details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadWebinarDetail();
  }, [id]);

  // New function to check registration status
  const checkRegistrationStatus = async (eventId: number) => {
    setIsCheckingStatus(true);
    try {
      const result = await auth_participants.event_participate_info(eventId);
      if (result.success && result.data) {
        setIsRegistered(true);
        setHasAttended(result.data.EventPCome || false);
      } else {
        setIsRegistered(false);
        setHasAttended(false);
      }
    } catch (error) {
      setIsRegistered(false);
      setHasAttended(false);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Format date for display
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "No date specified";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid date format";
    }
  };

  // Check if webinar is currently running
  const isWebinarLive = () => {
    if (!webinar?.dstart || !webinar?.dend) return false;
    const now = new Date();
    const startDate = new Date(webinar.dstart);
    const endDate = new Date(webinar.dend);
    return now >= startDate && now <= endDate;
  };

  const handleRegister = async () => {
    if (!webinar) return;

    setIsRegistering(true);
    try {
      const result = await auth_participants.event_participate_register({
        id: webinar.id,
        role: "normal",
      });

      console.log("🔍 DEBUG REGISTRATION RESULT:", result);

      if (result.success) {
        setIsRegistered(true);
        toast.success("Successfully registered for webinar!");
      } else {
        toast.error("Failed to register for webinar");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again later.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAttendanceClick = () => {
    console.log("🔍 DEBUG ATTENDANCE:");
    console.log("- isRegistered:", isRegistered);
    console.log("- hasAttended:", hasAttended);
    console.log("- isWebinarLive():", isWebinarLive());
    console.log("- webinar dates:", {
      start: webinar?.dstart,
      end: webinar?.dend,
      now: new Date().toISOString(),
    });

    if (!isRegistered) {
      toast.warning("You must register first before taking attendance");
      return;
    }

    if (!isWebinarLive()) {
      toast.warning(
        "Attendance can only be taken when the webinar is currently running"
      );
      return;
    }

    setIsQRScannerOpen(true);
  };

  const handleQRScanSuccess = async (code: string) => {
    if (!webinar) return;

    setIsSubmittingAttendance(true);
    try {
      const result = await auth_participants.submitAttendance({
        id: webinar.id,
        code: code,
      });

      if (result.success) {
        setHasAttended(true);
        toast.success(
          "Attendance successful! Thank you for attending the webinar."
        );
      } else {
        toast.error(result.message || "Failed to submit attendance");
      }
    } catch (error) {
      toast.error("Failed to submit attendance. Please try again later.");
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

  return (
    <DefaultLayout>
      <section>
        <div>
          {/* Image container with relative positioning */}
          <div className="relative">
            <Image
              alt="Webinar banner"
              className="object-cover rounded-xl"
              src={
                webinar?.imageUrl ||
                "https://heroui.com/images/hero-card-complete.jpeg"
              }
              width="100%"
              height="100mm"
            />

            {/* Live indicator positioned absolutely in top-right corner */}
            {isWebinarLive() && (
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  🔴 LIVE
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-row gap-2 px-4 py-2 justify-center flex-wrap">
            <Link
              className={buttonStyles({
                color: "secondary",
                radius: "full",
                variant: "bordered",
                size: "lg",
              })}
              href={webinar?.att || "#"}
              target={webinar?.att ? "_blank" : undefined}
            >
              Materials
            </Link>
            <Link
              className={buttonStyles({
                color: "secondary",
                radius: "full",
                variant: "ghost",
                size: "lg",
              })}
              href={webinar?.link || "#"}
              target={webinar?.link ? "_blank" : undefined}
            >
              Join Link
            </Link>

            {/* Registration Button with dynamic functionality */}
            {isLoading || isCheckingStatus ? (
              <Button
                color="secondary"
                radius="full"
                variant="bordered"
                size="lg"
                isDisabled
              >
                <Spinner size="sm" />
              </Button>
            ) : (
              <Button
                color={isRegistered ? "success" : "secondary"}
                radius="full"
                variant={isRegistered ? "flat" : "bordered"}
                size="lg"
                onClick={handleRegister}
                isDisabled={isRegistered || isRegistering}
                isLoading={isRegistering}
              >
                {isRegistered ? "✓ Registered" : "Register"}
              </Button>
            )}

            {/* Attendance Button with QR Scanner */}
            <Button
              color={hasAttended ? "success" : "secondary"}
              radius="full"
              variant={hasAttended ? "flat" : "bordered"}
              size="lg"
              onClick={handleAttendanceClick}
              isDisabled={
                !isRegistered || hasAttended || isSubmittingAttendance
              }
              isLoading={isSubmittingAttendance}
            >
              {hasAttended ? "✓ Attended" : "Check-in"}
            </Button>

            <Link
              className={buttonStyles({
                color: "secondary",
                radius: "full",
                variant: "bordered",
                size: "lg",
              })}
              href="#"
            >
              Certificate
            </Link>
          </div>
        </div>

        <div className="px-4 py-2">
          <div>
            <h1 className="font-bold text-4xl">
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                webinar?.name || "Webinar Series"
              )}
            </h1>
          </div>

          <div className="font-bold text-xl">
            Date:{" "}
            <span className="text-[#B6A3E8] font-bold">
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                formatDate(webinar?.dstart) || "No date specified"
              )}
            </span>
          </div>

          <div className="font-bold text-xl">
            Venue:{" "}
            <span className="text-[#B6A3E8] font-bold">
              {webinar?.att || "Online"}
            </span>
          </div>

          {/* Speaker info if available */}
          {!isLoading && webinar?.speaker && (
            <div className="font-bold text-xl">
              Speaker:{" "}
              <span className="text-[#B6A3E8] font-bold">
                {webinar.speaker}
              </span>
            </div>
          )}

          {/* Max participants if available */}
          {!isLoading && webinar?.max && webinar.max > 0 && (
            <div className="font-bold text-xl">
              Capacity:{" "}
              <span className="text-[#B6A3E8] font-bold">
                {webinar.max} participants
              </span>
            </div>
          )}

          <div>
            <h1 className="font-bold text-xl">Description:</h1>
            <p className="text-justify text-lg">
              {isLoading ? (
                <Spinner size="sm" />
              ) : webinar?.description && webinar.description.trim() !== "" ? (
                webinar.description
              ) : (
                "No description available for this webinar."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={handleQRScanSuccess}
        webinarId={webinar?.id || 0}
      />

      <ToastContainer />
    </DefaultLayout>
  );
}
