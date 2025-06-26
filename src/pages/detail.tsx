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
import { QRGenerator } from "@/components/QRGenerator";

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
  const [isQRGeneratorOpen, setIsQRGeneratorOpen] = useState(false);
  const [isCommittee, setIsCommittee] = useState(false);

  // Load webinar details when component mounts or id changes
  useEffect(() => {
    async function loadWebinarDetail() {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        const eventId = parseInt(id);

        const result = await auth_webinar.get_webinar_by_id(eventId);

        if (result.success && result.data) {
          const webinarData = Webinar.fromApiResponse(result.data);
          setWebinar(webinarData);

          // Check registration status dari API
          await checkRegistrationStatus(eventId);

          // Check committee status setelah data webinar berhasil didapat
          await handleCheckCommittee(eventId);
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

  // function to check registration status
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

  // Check if webinar has finished
  const isWebinarFinished = () => {
    if (!webinar?.dend) return false;
    const now = new Date();
    const endDate = new Date(webinar.dend);
    return now > endDate;
  };

  // Handle registration button click
  const handleRegister = async () => {
    if (!webinar) return;

    setIsRegistering(true);
    try {
      const result = await auth_participants.event_participate_register({
        id: webinar.id,
        role: "normal",
      });

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

  // Handle materials click
  const handleMaterialsClick = () => {
    toast.info("Materials feature is not implemented yet", {
      toastId: "materials-info",
    });
  };

  // Handle Scan QR Absence (committee action: open scanner)
  const handleQRScan = () => {
    setIsQRScannerOpen(true);
  };

  // Handle Generate QR Absence
  const handleGenerateQRAbsence = () => {
    setIsQRGeneratorOpen(true);
  };

  // Handle certificate click
  const handleCertificateClick = () => {
    toast.info("Certificate feature is not implemented yet", {
      toastId: "certificate-info",
    });
  };

  // Get webinar link with proper URL formatting
  const getWebinarLink = (link?: string) => {
    if (!link) return "#";
    return link.startsWith("http://") || link.startsWith("https://")
      ? link
      : `https://${link}`;
  };

  // Change committee check to use auth_participants
  const handleCheckCommittee = async (eventId: number) => {
    try {
      const result = await auth_participants.event_participate_info(eventId);

      if (
        result.success &&
        result.data &&
        result.data.EventPRole === "committee"
      ) {
        setIsCommittee(true);
      } else {
        setIsCommittee(false);
      }
    } catch (error) {
      setIsCommittee(false);
      toast.error("Failed to check committee status. Please try again later.");
    }
  };

  return (
    <DefaultLayout>
      <section>
        <div>
          {/* Image container with relative positioning */}
          <div className="relative flex justify-center mb-6">
            <Image
              alt="Webinar banner"
              className="object-cover rounded-xl mx-auto"
              src={
                webinar?.imageUrl ||
                "https://heroui.com/images/hero-card-complete.jpeg"
              }
              height={300}
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
            <Button
              className={buttonStyles({
                color: "secondary",
                radius: "full",
                variant: "bordered",
                size: "lg",
              })}
              isDisabled={!isRegistered}
              onClick={handleMaterialsClick}
              target={webinar?.att ? "_blank" : undefined}
            >
              Materials
            </Button>

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
              !isCommittee && (
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
              )
            )}

            {/* Attendance Button with QR Generator */}
            {!isCommittee ? (
              <Button
                color={hasAttended ? "success" : "secondary"}
                radius="full"
                variant={hasAttended ? "flat" : "bordered"}
                size="lg"
                isDisabled={!isRegistered || hasAttended || !isWebinarLive}
                isLoading={false}
                onClick={handleGenerateQRAbsence}
              >
                {hasAttended ? "✓ Attended" : "Check-in"}
              </Button>
            ) : (
              <>
                <Button
                  className={buttonStyles({
                    color: "secondary",
                    radius: "full",
                    variant: "bordered",
                    size: "lg",
                  })}
                  onClick={handleQRScan}
                >
                  Scan QR
                </Button>
                <Button
                  className={buttonStyles({
                    color: "secondary",
                    radius: "full",
                    variant: "bordered",
                    size: "lg",
                  })}
                >
                  View Participants
                </Button>
              </>
            )}

            <Button
              className={buttonStyles({
                color: "secondary",
                radius: "full",
                variant: "bordered",
                size: "lg",
              })}
              isDisabled={!isRegistered || !isWebinarFinished()}
              onClick={handleCertificateClick}
            >
              Certificate
            </Button>

            {isCommittee && (
              <Button
                className={buttonStyles({
                  color: "primary",
                  radius: "full",
                  variant: "solid",
                  size: "lg",
                })}
              >
                List Peserta
              </Button>
            )}
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
            {webinar?.att === "online" ? "Venue" : "Lokasi"}:{" "}
            <span className="text-[#B6A3E8] font-bold">
              {webinar?.link ? (
                <a
                  href={getWebinarLink(webinar.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#B6A3E8] font-bold hover:underline"
                >
                  {webinar.link}
                </a>
              ) : webinar?.att === "offline" ? (
                webinar?.att || "Offline Event"
              ) : (
                "No location specified"
              )}
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
      />

      {/* QR Generator Modal */}
      <QRGenerator
        isOpen={isQRGeneratorOpen}
        onClose={() => setIsQRGeneratorOpen(false)}
        eventId={webinar?.id || 0}
      />

      <ToastContainer />
    </DefaultLayout>
  );
}
