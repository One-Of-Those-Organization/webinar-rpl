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

// Detail Webinar Page

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registeredWebinars, setRegisteredWebinars] = useState<number[]>([]);
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
        } else {
          toast.error(result.message || "Gagal memuat detail webinar");
        }
      } catch (error) {
        toast.error("Gagal memuat detail webinar. Silakan coba lagi nanti.");
      } finally {
        setIsLoading(false);
      }
    }

    loadWebinarDetail();

    // Load registered webinars from localStorage
    const registered = localStorage.getItem("registered_webinars");
    if (registered) {
      setRegisteredWebinars(JSON.parse(registered));
    }
  }, [id]);

  // Format date for display
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "Senin, 28 April 2025"; // Default fallback
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return "Senin, 28 April 2025"; // Default fallback
    }
  };

  // Check if user is registered
  const isRegistered = webinar ? registeredWebinars.includes(webinar.id) : false;

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
      const result = await auth_participants.register({
        event_id: webinar.id,
        role: "normal"
      });

      if (result.success) {
        const newRegistered = [...registeredWebinars, webinar.id];
        setRegisteredWebinars(newRegistered);
        localStorage.setItem("registered_webinars", JSON.stringify(newRegistered));
        toast.success("Berhasil mendaftar webinar!");
      } else {
        toast.error(result.message || "Gagal mendaftar webinar");
      }
    } catch (error) {
      toast.error("Gagal mendaftar. Silakan coba lagi nanti.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAttendanceClick = () => {
    if (!isRegistered) {
      toast.warning("Anda harus mendaftar terlebih dahulu untuk melakukan absensi");
      return;
    }

    if (!isWebinarLive()) {
      toast.warning("Absensi hanya dapat dilakukan saat webinar sedang berlangsung");
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
        code: code
      });

      if (result.success) {
        toast.success("Absensi berhasil! Terima kasih telah menghadiri webinar.");
        // Store attendance status in localStorage
        const attendedWebinars = JSON.parse(localStorage.getItem("attended_webinars") || "[]");
        if (!attendedWebinars.includes(webinar.id)) {
          attendedWebinars.push(webinar.id);
          localStorage.setItem("attended_webinars", JSON.stringify(attendedWebinars));
        }
      } else {
        toast.error(result.message || "Gagal melakukan absensi");
      }
    } catch (error) {
      toast.error("Gagal melakukan absensi. Silakan coba lagi nanti.");
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

  // Check if user has attended
  const hasAttended = () => {
    if (!webinar) return false;
    const attendedWebinars = JSON.parse(localStorage.getItem("attended_webinars") || "[]");
    return attendedWebinars.includes(webinar.id);
  };

  return (
    <DefaultLayout>
      <section>
        <div>
          {/* Image container with relative positioning */}
          <div className="relative">
            <Image
              alt="Card background"
              className="object-cover rounded-xl"
              src={webinar?.imageUrl || "https://heroui.com/images/hero-card-complete.jpeg"}
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
              Materi
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
              Link
            </Link>
            
            {/* Registration Button with dynamic functionality */}
            {isLoading ? (
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
                {isRegistered ? "✓ Terdaftar" : "Daftar"}
              </Button>
            )}
            
            {/* Attendance Button with QR Scanner */}
            <Button
              color={hasAttended() ? "success" : "secondary"}
              radius="full"
              variant={hasAttended() ? "flat" : "bordered"}
              size="lg"
              onClick={handleAttendanceClick}
              isDisabled={!isRegistered || hasAttended() || isSubmittingAttendance}
              isLoading={isSubmittingAttendance}
            >
              {hasAttended() ? "✓ Hadir" : "Absensi"}
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
              Sertifikat
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
            Hari Tanggal :{" "}
            <span className="text-[#B6A3E8] font-bold">
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                formatDate(webinar?.dstart)
              )}
            </span>
          </div>
          <div className="font-bold text-xl">
            Tempat : <span className="text-[#B6A3E8] font-bold">Online</span>
          </div>
          
          {/* Speaker info if available */}
          {!isLoading && webinar?.speaker && (
            <div className="font-bold text-xl">
              Speaker : <span className="text-[#B6A3E8] font-bold">{webinar.speaker}</span>
            </div>
          )}
          
          {/* Max participants if available */}
          {!isLoading && webinar?.max && webinar.max > 0 && (
            <div className="font-bold text-xl">
              Kapasitas : <span className="text-[#B6A3E8] font-bold">{webinar.max} peserta</span>
            </div>
          )}
          
          <div>
            <h1 className="font-bold text-xl">Deskripsi :</h1>
            <p className="text-justify text-lg">
              {isLoading ? (
                <Spinner size="sm" />
              ) : webinar?.description && webinar.description.trim() !== "" ? (
                webinar.description
              ) : (
                "Lorem ipsum dolor sit amet consectetur, adipisicing elit. At voluptatem commodi consectetur exercitationem repellat quibusdam nisi, eos quos atque repudiandae sequi fuga repellendus omnis? Culpa obcaecati debitis architecto qui corporis."
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