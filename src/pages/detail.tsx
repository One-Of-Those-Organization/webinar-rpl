import { button as buttonStyles } from "@heroui/theme";
import DefaultLayout from "@/layouts/default";
import {
  Image,
  Button,
  Spinner,
  Card,
  CardBody,
  Select,
  SelectItem,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth_webinar } from "@/api/auth_webinar";
import { API_URL } from "@/api/endpoint";
import { auth_participants } from "@/api/auth_participants";
import { Webinar } from "@/api/interface";
import { toast, ToastContainer } from "react-toastify";
import { QRScanner } from "@/components/QRScanner";
import { QRGenerator } from "@/components/QRGenerator";
import { useNavigate } from "react-router-dom";
import { auth_material } from "@/api/auth_material";
import { Input, Textarea } from "@heroui/input";
import { FaTrash } from "react-icons/fa";

// Webinar Detail Page

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const [webinar, setWebinar] = useState<Webinar | null>(null);

  // Navigate hook for programmatic navigation
  const navigate = useNavigate();

  // Error State
  const [error, setError] = useState<string>("");

  // Toggle Mode (Edit or View)
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // State for loading, registration, attendance, and committee status
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [hasAttended, setHasAttended] = useState<boolean>(false);
  const [isCommittee, setIsCommittee] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [isQRGeneratorOpen, setIsQRGeneratorOpen] = useState<boolean>(false);
  const [materialLink, setMaterialLink] = useState<string>("");

  // Form data state
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    speaker: "",
    dateStart: "",
    timeStart: "",
    dateEnd: "",
    timeEnd: "",
    att: "",
    link: "",
    imageUrl: "",
    max: 0,
    certId: 0,
    panitia: [] as string[],
    materialLink: "",
  });

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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

  useEffect(() => {
    if (webinar?.name) {
      document.title = `${webinar.name} | Webinar Detail`;
    }
  }, [webinar]);

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

    if (isWebinarFinished()) {
      toast.info("Webinar has already finished, registration is closed.", {
        toastId: "registration-closed",
      });
      return;
    }

    setIsRegistering(true);
    try {
      const result = await auth_participants.event_participate_register({
        id: webinar.id,
        role: "normal",
      });

      if (result.success) {
        setIsRegistered(true);
        toast.success("Successfully registered for webinar!", {
          toastId: "registration-success",
        });
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
    if (!isRegistered && isWebinarFinished()) {
      toast.info("Webinar has finished, registration is closed.", {
        toastId: "registration-closed",
      });
      return;
    } else if (!isRegistered) {
      toast.info("You must register first", {
        toastId: "registration-info",
      });
      return;
    } else {
      toast.info("Materials feature is not implemented yet", {
        toastId: "materials-info",
      });
    }
  };

  // Handle Scan QR Absence (committee action: open scanner)
  const handleQRScan = () => {
    setIsQRScannerOpen(true);
  };

  // Handle Generate QR Absence
  const handleGenerateQRAbsence = () => {
    if (!isRegistered && isWebinarFinished()) {
      toast.info("Webinar has finished, registration is closed.", {
        toastId: "registration-closed",
      });
      return;
    } else if (isRegistered && isWebinarFinished()) {
      toast.info("Webinar has finished, you cannot generate QR code.", {
        toastId: "qr-absence-info",
      });
      return;
    } else if (!isRegistered) {
      toast.info("You must register first", {
        toastId: "registration-info",
      });
      return;
    } else if (!isWebinarLive()) {
      toast.info("The webinar is not live, you cannot generate QR code.", {
        toastId: "qr-absence-info",
      });
      return;
    } else {
      setIsQRGeneratorOpen(true);
    }
  };

  // Handle participants click (committee action: view participants)
  const handleParticipantsClick = async () => {
    toast.info("Participants feature is not implemented yet", {
      toastId: "participants-info",
    });
  };

  // Handle certificate click
  const handleCertificateClick = async () => {
    if (!isRegistered && isWebinarFinished()) {
      toast.info("Webinar has finished, registration is closed.", {
        toastId: "registration-closed",
      });
      return;
    } else if (!isRegistered) {
      toast.info("You must register first", {
        toastId: "registration-info",
      });
      return;
    } else if (!hasAttended) {
      toast.info(
        "You must attend the webinar and it must be finished to get the certificate.",
        { toastId: "attended-info" }
      );
      return;
    } else if (!isWebinarFinished()) {
      toast.info(
        "Webinar has not finished yet, certificate is not available.",
        {
          toastId: "certificate-info",
        }
      );
      return;
    } else {
      const response = await auth_participants.event_participate_info(id)
      if (!response.success) {
        toast.info(
          "An error occured when trying to fetch the event participants.",
          {
            toastId: "certificate-info",
          }
        );
      }
      const evpart = response.data;
      const link = `${API_URL}/api/certificate/${evpart.EventPCode}`;
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  // Handle edit webinar click (committee action)
  const handleEditWebinarClick = () => {
    if (!isEditMode) {
      toast.info("Entering edit mode...", { toastId: "edit-mode-info" });
      setIsEditMode(true);
    } else {
      toast.info("Exiting edit mode...", { toastId: "exit-edit-mode-info" });
      setIsEditMode(false);
    }
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
          <div className="flex flex-col items-center mb-2">
            {/* Banner info, lebar sama dengan gambar */}
            {isWebinarFinished() && (
              <div className="w-full max-w-md bg-[#B6A3E8]/20 text-[#B6A3E8] font-semibold px-4 py-2 mb-3 rounded text-center">
                This webinar has already finished.
              </div>
            )}

            {/* Image container */}
            <div className="relative flex justify-center w-full max-w-md">
              <Image
                alt="Webinar banner"
                className="object-cover rounded-xl mx-auto"
                src={
                  webinar?.imageUrl ||
                  "https://heroui.com/images/hero-card-complete.jpeg"
                }
                height={300}
              />
              {isWebinarLive() && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    🔴 LIVE
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* View Mode */}
          {!isEditMode ? (
            <div className="flex flex-row gap-2 px-4 py-2 justify-center flex-wrap">
              {/* Materials Webinar */}
              <Button
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: isRegistered ? "solid" : "bordered",
                  size: "lg",
                })}
                onClick={handleMaterialsClick}
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
                // If not committee, show register button
                !isCommittee && (
                  <Button
                    color={isRegistered ? "success" : "secondary"}
                    radius="full"
                    variant={isRegistered ? "solid" : "bordered"}
                    size="lg"
                    onClick={handleRegister}
                    isLoading={isRegistering}
                    isDisabled={isRegistered}
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
                  variant={isWebinarLive() ? "solid" : "bordered"}
                  size="lg"
                  isLoading={false}
                  isDisabled={hasAttended}
                  onClick={handleGenerateQRAbsence}
                >
                  {hasAttended ? "✓ Attended" : "Check-in"}
                </Button>
              ) : (
                // If committee, show QR Scanner and Participants List
                <>
                  <Button
                    className={buttonStyles({
                      color: "secondary",
                      radius: "full",
                      variant: isWebinarLive() ? "solid" : "bordered",
                      size: "lg",
                    })}
                    onClick={handleQRScan}
                  >
                    Scan QR
                  </Button>

                  {/* Show List Participants */}
                  <Button
                    className={buttonStyles({
                      color: "secondary",
                      radius: "full",
                      variant: "solid",
                      size: "lg",
                    })}
                    onClick={handleListParticipantsClick}
                  >
                    View Participants
                  </Button>
                </>
              )}

              {/* Generate Certificate */}
              <Button
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant:
                    hasAttended && isWebinarFinished() ? "solid" : "bordered",
                  size: "lg",
                })}
                onClick={handleCertificateClick}
              >
                Certificate
              </Button>

              {/* Edit Webinar Button */}
              {isCommittee && (
                <Button
                  className={buttonStyles({
                    color: "secondary",
                    radius: "full",
                    variant: "bordered",
                    size: "lg",
                  })}
                  onClick={handleEditWebinarClick}
                >
                  Edit Webinar
                </Button>
              )}
            </div>
          ) : (
            // Edit Mode
            <div className="flex justify-center items-center gap-2 mt-2 mb-4">
              {/* Save Changes */}
              <Button
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "solid",
                  size: "lg",
                })}
                onClick={() => toast.info("Edit mode is not implemented yet")}
              >
                Save Changes
              </Button>

              {/* Cancel Changes */}
              <Button
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "solid",
                  size: "lg",
                })}
                onClick={handleEditWebinarClick}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* EDIT MODE SECTION */}
          {isEditMode ? (
            <Card>
              <CardBody className="space-y-4">
                {error && (
                  <div className="text-red-500 text-sm mb-4">{error}</div>
                )}
                {/* Edit Webinar Name */}
                <Input
                  color="secondary"
                  label="Webinar Name"
                  placeholder="Enter webinar name"
                  value={editForm.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  isRequired
                />

                {/* Edit Webinar Speaker Name */}
                <Input
                  color="secondary"
                  label="Speaker Name"
                  placeholder="Enter speaker name"
                  value={editForm.speaker}
                  onChange={(e) => handleInputChange("speaker", e.target.value)}
                  isRequired
                />

                {/* Edit Webinar Start Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    color="secondary"
                    label="Start Date"
                    type="date"
                    // min={todayDate}
                    // value={editForm.dateStart}
                    // onChange={(e) =>
                    //   handleInputChange("dateStart", e.target.value)
                    // }
                    isRequired
                  />

                  {/* Edit Webinar Start Time */}
                  <Input
                    color="secondary"
                    label="Start Time"
                    type="time"
                    // value={editForm.timeStart}
                    // onChange={(e) => handleTimeChange("start", e.target.value)}
                    isRequired
                  />
                </div>

                {/* Edit Webinar End Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    color="secondary"
                    label="End Date"
                    type="date"
                    // min={editForm.dateStart || todayDate}
                    // value={editForm.dateEnd}
                    // onChange={(e) =>
                    //   handleInputChange("dateEnd", e.target.value)
                    // }
                    isRequired
                  />
                  {/* Edit Webinar End Time */}
                  <Input
                    color="secondary"
                    label="End Time"
                    type="time"
                    // value={editForm.timeEnd}
                    // onChange={(e) => handleTimeChange("end", e.target.value)}
                    isRequired
                  />
                </div>

                {/* Edit Webinar Attendance Type */}
                <Select
                  color="secondary"
                  label="Attendance Type"
                  // selectedKeys={[editForm.att]}
                  // onSelectionChange={(keys) => {
                  //   const [value] = Array.from(keys);
                  //   setEditForm((prev) => ({
                  //     ...prev,
                  //     att: value as string,
                  //   }));
                  // }}
                  className="w-full"
                  variant="bordered"
                  isRequired
                >
                  <SelectItem key="online">Online</SelectItem>
                  <SelectItem key="offline">Offline</SelectItem>
                </Select>

                {/* Edit Webinar Precise Location */}
                <Input
                  color="secondary"
                  // label={
                  //   editForm.att === "online" ? "Webinar Link" : "Location"
                  // }
                  // placeholder={
                  //   editForm.att === "online" ? "https://..." : "Enter location"
                  // }
                  // value={editForm.link}
                  // onChange={(e) => handleInputChange("link", e.target.value)}
                />

                {/* Edit Webinar Poster */}
                <Input
                  color="secondary"
                  label="Webinar Image"
                  type="file"
                  accept="image/*"
                  // onChange={handleWebinarImageUpload}
                  // disabled={isImageLoading}
                  description="Maximum file size: 3MB. Supported formats: JPG, PNG, WebP"
                />

                {/* Edit Webinar Maximum Participants */}
                <Input
                  color="secondary"
                  label="Maximum Participants"
                  type="number"
                  placeholder="Enter maximum number of participants"
                  // value={editForm.max === 0 ? "" : editForm.max.toString()}
                  // onChange={(e) => {
                  //   const value = e.target.value;
                  //   handleInputChange(
                  //     "max",
                  //     value === "" ? 0 : parseInt(value) || 0,
                  //   );
                  // }}
                  isRequired
                />

                {/* Edit Webinar Certificate */}
                <Input
                  color="secondary"
                  label="Certificate Template ID"
                  type="number"
                  placeholder="1"
                  min="1"
                  // value={
                  //   editForm.certId === 0 ? "" : editForm.certId.toString()
                  // }
                  // onChange={(e) => {
                  //   const value = e.target.value;
                  //   handleInputChange(
                  //     "certId",
                  //     value === "" ? 1 : parseInt(value) || 1,
                  //   );
                  // }}
                />

                {/* Edit Webinar Material */}
                <div className="relative w-full">
                  <Input
                    color="secondary"
                    label="Material (Google Drive Link, dsb)"
                    placeholder="https://drive.google.com/..."
                    // value={editForm.materialLink}
                    // onChange={(e) =>
                    //   handleInputChange("materialLink", e.target.value)
                    // }
                    className="w-full pr-12" // beri padding kanan untuk icon
                  />
                  {/* {materialId && (
                    <button
                      type="button"
                      // onClick={handleDeleteMaterial}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow"
                      // disabled={isEditing}
                      aria-label="Delete material"
                      style={{ zIndex: 10 }}
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  )} */}

                  {/* Edit Webinar Description */}
                  <Textarea
                    color="secondary"
                    label="Description"
                    placeholder="Enter webinar description"
                    // value={editForm.description}
                    // onChange={(e) =>
                    //   handleInputChange("description", e.target.value)
                    // }
                    minRows={4}
                    isRequired
                  />
                </div>
              </CardBody>
            </Card>
          ) : (
            <>
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
                        href={webinar.link}
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
                    ) : webinar?.description &&
                      webinar.description.trim() !== "" ? (
                      webinar.description
                    ) : (
                      "No description available for this webinar."
                    )}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

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
      </section>
    </DefaultLayout>
  );
}
