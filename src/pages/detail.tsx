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
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { QRScanner } from "@/components/QRScanner";

// Webinar Detail Page

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasAttended, setHasAttended] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [participantRole, setParticipantRole] = useState<string>("");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isQRDisplayOpen, setIsQRDisplayOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    async function loadWebinarDetail() {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        // Load webinar details
        const result = await auth_webinar.get_webinar_by_id(parseInt(id));

        if (result.success && result.data) {
          const webinarData = Webinar.fromApiResponse(result.data);
          setWebinar(webinarData);

          // Load user profile to get role
          await loadUserProfile();

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

  // Load user profile to get role
  const loadUserProfile = async () => {
    try {
      const result = await auth_participants.get_user_profile();
      if (result.success && result.data) {
        setUserRole(result.data.UserRole?.toString() || "2"); // Default to normal user (2)
        console.log("🔍 User role:", result.data.UserRole);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      setUserRole("2"); // Default to normal user
    }
  };

  // Listen for storage changes and webinar registration events
  useEffect(() => {
    const handleStorageChange = () => {
      if (id) {
        checkRegistrationStatus(parseInt(id));
      }
    };

    const handleWebinarRegistered = (event: CustomEvent) => {
      if (id && event.detail.webinarId === parseInt(id)) {
        setIsRegistered(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('webinar-registered', handleWebinarRegistered as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('webinar-registered', handleWebinarRegistered as EventListener);
    };
  }, [id]);

  // Countdown effect for upcoming webinars
  useEffect(() => {
    if (!webinar?.dstart) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const startTime = new Date(webinar.dstart).getTime();
      const difference = startTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [webinar?.dstart]);

  // New function to check registration status
  const checkRegistrationStatus = async (eventId: number) => {
    setIsCheckingStatus(true);
    try {
      console.log("🔍 Checking registration status for event:", eventId);
      const result = await auth_participants.event_participate_info(eventId);
      console.log("🔍 Registration status result:", result);
      
      if (result.success && result.data) {
        setIsRegistered(true);
        setHasAttended(result.data.EventPCome || false);
        setParticipantRole(result.data.EventPRole || "normal");
        console.log("✅ User is registered, attendance:", result.data.EventPCome);
        console.log("🔍 Participant role:", result.data.EventPRole);
      } else {
        setIsRegistered(false);
        setHasAttended(false);
        setParticipantRole("");
        console.log("❌ User is not registered");
      }
    } catch (error) {
      console.error("Error checking registration status:", error);
      setIsRegistered(false);
      setHasAttended(false);
      setParticipantRole("");
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

  // Check if webinar is upcoming
  const isWebinarUpcoming = () => {
    if (!webinar?.dstart) return false;
    const now = new Date();
    const startDate = new Date(webinar.dstart);
    return now < startDate;
  };

  // Check if webinar has ended
  const isWebinarEnded = () => {
    if (!webinar?.dend) return false;
    const now = new Date();
    const endDate = new Date(webinar.dend);
    return now > endDate;
  };

  // Check if user is committee
  const isCommittee = () => {
    return userRole === "1" || participantRole === "committee";
  };

  // Get button state based on webinar status and registration
  const getRegisterButtonState = () => {
    // Priority 1: Already registered
    if (isRegistered) {
      return {
        text: "✓ Registered",
        color: "success" as const,
        variant: "flat" as const,
        disabled: true,
        clickable: false
      };
    }

    // Priority 2: Webinar is upcoming
    if (isWebinarUpcoming()) {
      return {
        text: "Upcoming",
        color: "default" as const,
        variant: "bordered" as const,
        disabled: true,
        clickable: false
      };
    }

    // Priority 3: Webinar is live
    if (isWebinarLive()) {
      return {
        text: "Register Now",
        color: "primary" as const,
        variant: "solid" as const,
        disabled: false,
        clickable: true
      };
    }

    // Priority 4: Webinar has ended
    if (isWebinarEnded()) {
      return {
        text: "Registration Closed",
        color: "default" as const,
        variant: "bordered" as const,
        disabled: true,
        clickable: false
      };
    }

    // Default state
    return {
      text: "Register",
      color: "secondary" as const,
      variant: "bordered" as const,
      disabled: false,
      clickable: true
    };
  };

  const handleRegister = async () => {
    if (!webinar) return;

    // Check if registration is allowed
    const buttonState = getRegisterButtonState();
    if (!buttonState.clickable) {
      if (isWebinarUpcoming()) {
        toast.warning("Registration will be available when the webinar goes live");
      } else if (isWebinarEnded()) {
        toast.warning("Registration is closed. This webinar has ended");
      }
      return;
    }

    setIsRegistering(true);
    try {
      console.log("🔍 Attempting to register for webinar:", webinar.id);
      
      const result = await auth_participants.event_participate_register({
        id: webinar.id,
        role: "normal",
      });

      console.log("🔍 DEBUG REGISTRATION RESULT:", result);

      if (result.success) {
        setIsRegistered(true);
        toast.success("Successfully registered for webinar!");
        
        // Update localStorage to trigger storage event
        const currentRegistered = JSON.parse(localStorage.getItem("registered_webinars") || "[]");
        if (!currentRegistered.includes(webinar.id)) {
          const newRegistered = [...currentRegistered, webinar.id];
          localStorage.setItem("registered_webinars", JSON.stringify(newRegistered));
        }
        
        // Trigger custom event for same-page updates
        window.dispatchEvent(new CustomEvent('webinar-registered', { 
          detail: { webinarId: webinar.id } 
        }));
      } else {
        toast.error(result.message || "Failed to register for webinar");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again later.");
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle attendance/check-in based on role
  const handleAttendanceClick = () => {
    console.log("🔍 DEBUG ATTENDANCE:");
    console.log("- isRegistered:", isRegistered);
    console.log("- hasAttended:", hasAttended);
    console.log("- isWebinarLive():", isWebinarLive());
    console.log("- userRole:", userRole);
    console.log("- participantRole:", participantRole);
    console.log("- isCommittee():", isCommittee());

    if (!isWebinarLive()) {
      toast.warning(
        "Check-in is only available when the webinar is currently running"
      );
      return;
    }

    // Committee can scan QR codes
    if (isCommittee()) {
      setIsQRScannerOpen(true);
      return;
    }

    // Normal users need to be registered first
    if (!isRegistered) {
      toast.warning("You must register first before checking in");
      return;
    }

    if (hasAttended) {
      toast.info("You have already checked in for this webinar");
      return;
    }

    // Show QR code display modal for normal users
    setIsQRDisplayOpen(true);
  };

  // Handle QR scan success
  const handleQRScanSuccess = async (scannedData: string) => {
    try {
      console.log("🔍 QR scan success:", scannedData);
      
      // Parse QR code data
      let qrData;
      try {
        qrData = JSON.parse(scannedData);
      } catch (e) {
        // If not JSON, treat as simple code
        qrData = { participantCode: scannedData };
      }

      // Submit attendance
      const result = await auth_participants.submitAttendance({
        id: qrData.eventId || webinar?.id || 0,
        code: qrData.participantCode || scannedData,
      });

      if (result.success) {
        toast.success("Attendance recorded successfully!");
        // Refresh registration status to update UI
        if (id) {
          await checkRegistrationStatus(parseInt(id));
        }
      } else {
        toast.error(result.message || "Failed to record attendance");
      }
    } catch (error) {
      console.error("Error processing QR scan:", error);
      toast.error("Failed to process QR code");
    }
  };

  const buttonState = getRegisterButtonState();

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

            {/* Status indicators */}
            {isWebinarLive() && (
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse shadow-lg">
                  🔴 LIVE
                </span>
              </div>
            )}

            {isWebinarUpcoming() && (
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  📅 UPCOMING
                </span>
              </div>
            )}

            {isWebinarEnded() && (
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  🏁 ENDED
                </span>
              </div>
            )}

            {/* Role indicator for debugging */}
            {process.env.NODE_ENV === 'development' && (
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">
                  {isCommittee() ? "👑 COMMITTEE" : "👤 USER"}
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
                color={buttonState.color}
                radius="full"
                variant={buttonState.variant}
                size="lg"
                onClick={handleRegister}
                isDisabled={buttonState.disabled || isRegistering}
                isLoading={isRegistering}
                className={buttonState.disabled ? "opacity-50 cursor-not-allowed" : ""}
              >
                {buttonState.text}
              </Button>
            )}

            {/* Check-in Button - Different behavior based on role */}
            <Button
              color={hasAttended || isCommittee() ? "success" : "secondary"}
              radius="full"
              variant={hasAttended ? "flat" : "bordered"}
              size="lg"
              onClick={handleAttendanceClick}
              isDisabled={!isWebinarLive()}
              className={!isWebinarLive() ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isCommittee() ? (
                "📷 Scan QR"
              ) : hasAttended ? (
                "✅ Checked In"
              ) : (
                "📱 Check-in"
              )}
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
              Online
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

      {/* QR Code Display Modal (for normal users) */}
      <QRCodeDisplay
        isOpen={isQRDisplayOpen}
        onClose={() => setIsQRDisplayOpen(false)}
        webinarId={webinar?.id || 0}
        webinarName={webinar?.name || ""}
      />

      {/* QR Scanner Modal (for committee) */}
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