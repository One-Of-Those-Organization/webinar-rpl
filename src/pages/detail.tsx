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
  Dropdown,
  DropdownTrigger,
  Chip,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth_webinar } from "@/api/auth_webinar";
import { API_URL } from "@/api/endpoint";
import { auth_participants } from "@/api/auth_participants";
import { Webinar } from "@/api/interface";
import { toast, ToastContainer } from "react-toastify";
import { QRScanner } from "@/components/QRScanner";
import { QRGenerator } from "@/components/QRGenerator";
import { auth_material } from "@/api/auth_material";
import { Input, Textarea } from "@heroui/input";
import { FaExclamationTriangle, FaTrash } from "react-icons/fa";
import {
  extractDate,
  extractTime,
  formatDateDisplay,
  getTodayDate,
  combineDateAndTime,
} from "@/components/webinar_gaeroh";
import { auth_user } from "@/api/auth_user";
import { VerticalDotsIcon } from "@/components/icons";

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Main Data States
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [materialId, setMaterialId] = useState<number | null>(null);
  const [materialLink, setMaterialLink] = useState<string>("");
  const [panitiaData, setPanitiaData] = useState<any[]>([]);
  const [existingCommittee, setExistingCommittee] = useState<any[]>([]);

  // UI/UX States
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [isLoadingCommittee, setIsLoadingCommittee] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [hasAttended, setHasAttended] = useState<boolean>(false);
  const [isCommittee, setIsCommittee] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [isQRGeneratorOpen, setIsQRGeneratorOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(
    "https://heroui.com/images/hero-card-complete.jpeg",
  );

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger",
  });

  // Form state
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
    panitia: [] as string[],
    materialLink: "",
  });

  const todayDate = getTodayDate();

  // --------- LOAD DATA ---------
  // Load webinar detail (with useCallback for refresh)
  const loadWebinarDetail = useCallback(
    async (forceId?: number) => {
      const eventId = forceId ?? (id ? parseInt(id) : undefined);
      if (!eventId) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const result = await auth_webinar.get_webinar_by_id(eventId);
        if (result.success && result.data) {
          const webinarData = Webinar.fromApiResponse(result.data);
          setWebinar(webinarData);
          setEditForm({
            name: webinarData.name || "",
            description: webinarData.description || "",
            speaker: webinarData.speaker || "",
            dateStart: extractDate(webinarData.dstart) || todayDate,
            timeStart: extractTime(webinarData.dstart) || "00:00",
            dateEnd: extractDate(webinarData.dend) || todayDate,
            timeEnd: extractTime(webinarData.dend) || "00:00",
            att: webinarData.att || "",
            link: webinarData.link || "",
            imageUrl: webinarData.imageUrl || "",
            max: webinarData.max || 0,
            panitia: [],
            materialLink: "",
          });
          setPreviewImage(
            webinarData.imageUrl ||
              "https://heroui.com/images/hero-card-complete.jpeg",
          );
          await checkRegistrationStatus(eventId);
          await handleCheckCommittee(eventId);
          await loadExistingCommittee(eventId);
          await fetchMaterial(eventId);
        } else {
          toast.error(result.message || "Failed to load webinar details");
        }
      } catch (error) {
        toast.error("Failed to load webinar details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    },
    [id, todayDate],
  );

  // Initial load
  useEffect(() => {
    loadWebinarDetail();
    // eslint-disable-next-line
  }, [id]);

  // Fetch users for committee (on edit mode only)
  useEffect(() => {
    if (isEditMode && panitiaData.length === 0) handleFetchUser();
  }, [isEditMode]);

  // --------- DATA FETCHERS ---------
  const fetchMaterial = async (webinarId: number) => {
    const response = await auth_material.get_material(webinarId);
    if (response.success && response.data) {
      setMaterialId(response.data.ID);
      setMaterialLink(response.data.EventMatAttachment || "");
      setEditForm((prev) => ({
        ...prev,
        materialLink: response.data.EventMatAttachment || "",
      }));
    } else {
      setMaterialId(null);
      setMaterialLink("");
      setEditForm((prev) => ({
        ...prev,
        materialLink: "",
      }));
    }
  };

  // Fetch user list for panitia (committee)
  const handleFetchUser = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await auth_user.get_all_users();
      if (response.success) {
        const userData = response.data;
        const formattedUserData = userData.map((user: any) => ({
          id: user.ID,
          role: user.UserRole,
          name: user.UserFullName,
          email: user.UserEmail,
        }));
        setPanitiaData(formattedUserData);
      } else {
        toast.error("Failed to fetch user data");
      }
    } catch (error) {
      toast.error("Failed to fetch user data");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch existing committee for this event
  const loadExistingCommittee = async (eventId: number) => {
    try {
      setIsLoadingCommittee(true);
      const response =
        await auth_participants.get_participants_by_event(eventId);
      if (response.success) {
        const committeeMembers = response.data.filter(
          (participant: any) => participant.EventPRole === "committee",
        );
        setExistingCommittee(committeeMembers);
        const existingEmails = committeeMembers.map(
          (member: any) => member.User.UserEmail,
        );
        setEditForm((prev) => ({
          ...prev,
          panitia: existingEmails,
        }));
      }
    } catch (error) {
      toast.error("Failed to load committee members");
    } finally {
      setIsLoadingCommittee(false);
    }
  };

  // --------- STATUS CHECKERS ---------
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

  // --------- FORM HANDLERS ---------
  const handleInputChange = (field: string, value: string | number) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTimeChange = (type: "start" | "end", value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [type === "start" ? "timeStart" : "timeEnd"]: value,
    }));
  };

  // --------- IMAGE UPLOAD ---------
  const handleWebinarImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const maxSizeInBytes = 3 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError("Image size must be less than 3MB");
      toast.info("Image size must be less than 3MB", {
        toastId: "imageSizeError",
      });
      event.target.value = "";
      return;
    }
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, JPEG, PNG, and WebP images are allowed");
      toast.info("Only JPG, JPEG, PNG, and WebP images are allowed", {
        toastId: "imageTypeError",
      });
      event.target.value = "";
      return;
    }
    setIsImageLoading(true);
    toast.info("Uploading Webinar Image...", { toastId: "uploadingImage" });
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      setPreviewImage(base64Image);
      try {
        const response = await auth_webinar.post_webinar_image({
          data: base64Image,
        });
        if (response.success) {
          let serverPath = response.data?.filename || response.data;
          const staticUrl = serverPath;
          setEditForm((prev) => ({ ...prev, imageUrl: staticUrl }));
          setPreviewImage(staticUrl);
          toast.success("Webinar Image Uploaded Successfully!");
        } else {
          setPreviewImage(
            editForm.imageUrl ||
              "https://heroui.com/images/hero-card-complete.jpeg",
          );
          setError("Image upload failed. Please try again.");
          toast.error("Image upload failed. Please try again.");
        }
      } catch (error) {
        setPreviewImage(
          editForm.imageUrl ||
            "https://heroui.com/images/hero-card-complete.jpeg",
        );
        setError("An error occurred while uploading the image.");
        toast.error("An error occurred while uploading the image.");
      } finally {
        setIsImageLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // --------- WEBINAR/COMMITTEE LOGIC ---------
  const isWebinarLive = () => {
    if (!webinar?.dstart || !webinar?.dend) return false;
    const now = new Date();
    const startDate = new Date(webinar.dstart);
    const endDate = new Date(webinar.dend);
    return now >= startDate && now <= endDate;
  };

  const isWebinarFinished = () => {
    if (!webinar?.dend) return false;
    const now = new Date();
    const endDate = new Date(webinar.dend);
    return now > endDate;
  };

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
      window.open(materialLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleAbsence = async () => {
    if (!webinar) return;

    if (!isRegistered && isWebinarFinished()) {
      toast.info("Webinar has finished, registration is closed.", {
        toastId: "registration-closed",
      });
      return;
    }
    if (!isRegistered) {
      toast.info("You must register first", {
        toastId: "registration-info",
      });
      return;
    }
    if (hasAttended) {
      toast.info("You have already marked your attendance.", {
        toastId: "already-attended",
      });
      return;
    }
    if (isWebinarFinished()) {
      toast.info("The webinar has finished, you cannot mark attendance.", {
        toastId: "webinar-finished",
      });
      return;
    }
    if (!isWebinarLive()) {
      toast.info("The webinar is not live, you cannot mark attendance.", {
        toastId: "absence-info",
      });
      return;
    }

    try {
      const resp = await auth_participants.event_participate_info(webinar.id);
      if (!resp.success || !resp.data || !resp.data.EventPCode) {
        toast.error("Failed to get your participant code. Please try again.");
        return;
      }
      const eventPCode = resp.data.EventPCode;
      const response = await auth_participants.event_participate_absence({
        id: webinar.id,
        code: eventPCode,
      });
      if (response.success) {
        setHasAttended(true);
        toast.success("Attendance marked successfully!", {
          toastId: "attendance-success",
        });
      } else {
        toast.error(response.message || "Failed to mark attendance");
      }
    } catch (error) {
      toast.error("An error occurred while marking attendance");
    }
  };

  const handleQRScan = () => {
    if (!isWebinarLive()) {
      toast.info("The webinar is not live, you cannot scan QR code.", {
        toastId: "qr-scan-info",
      });
      return;
    } else {
      setIsQRScannerOpen(true);
    }
  };

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
    } else if (hasAttended) {
      toast.info("You have already marked your attendance.", {
        toastId: "already-attended",
      });
      return;
    } else if (isWebinarFinished()) {
      toast.info("The webinar has finished, you cannot generate QR code.", {
        toastId: "webinar-finished",
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

  const handleListParticipantsClick = () => {
    if (!id) {
      toast.error("Webinar ID is not available."), { toastId: "detail-error" };
      return;
    }
    navigate(`/list-partisipant/${id}`);
  };

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
    } else if (!hasAttended && !isCommittee) {
      toast.info(
        "You must attend the webinar and it must be finished to get the certificate.",
        { toastId: "attended-info" },
      );
      return;
    } else if (!isWebinarFinished()) {
      toast.info(
        "Webinar has not finished yet, certificate is not available.",
        {
          toastId: "certificate-info",
        },
      );
      return;
    } else {
      if (!id) return;
      const response = await auth_participants.event_participate_info(
        parseInt(id),
      );
      if (!response.success) {
        toast.info(
          "An error occured when trying to fetch the event participants.",
          {
            toastId: "certificate-info",
          },
        );
      }
      const evpart = response.data;
      const link = `${API_URL}/api/certificate/${evpart.EventPCode}`;
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  // COMMITTEE LOGIC
  const registEventParticipant = async (user: any) => {
    if (!webinar || typeof webinar.id !== "number") {
      toast.error("Webinar ID not found!");
      return false;
    }
    try {
      const requestData = {
        id: webinar.id,
        email: user.email,
        role: "committee",
      };
      const response =
        await auth_participants.event_participate_register(requestData);
      if (response.success) {
        return true;
      } else {
        toast.error(`Failed to register user ${user.name} as committee`);
        return false;
      }
    } catch {
      toast.error("Unexpected error registering committee");
      return false;
    }
  };

  const handleChangeRole = async (userEmail: string, newRole: string) => {
    if (!webinar?.id) return;
    if (newRole === "normal") {
      setShowConfirmModal({
        isOpen: true,
        title: "Change Role",
        message: `Change ${userEmail} from committee to normal participant?`,
        type: "warning",
        onConfirm: async () => {
          setShowConfirmModal((prev) => ({ ...prev, isOpen: false }));
          try {
            const response = await auth_participants.event_participate_edit({
              event_id: webinar.id,
              email: userEmail,
              event_role: newRole,
            });
            if (response.success) {
              toast.success(`User role changed to ${newRole}`);
              await loadExistingCommittee(webinar.id);
            } else {
              toast.error("Failed to change user role");
            }
          } catch {
            toast.error("Error changing user role");
          }
        },
      });
    }
  };

  const handleRemoveParticipant = async (userEmail: string) => {
    if (!webinar?.id) return;
    setShowConfirmModal({
      isOpen: true,
      title: "Remove Participant",
      message: `Are you sure you want to remove ${userEmail} from this webinar? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        setShowConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          const response = await auth_participants.event_participate_delete({
            event_id: webinar.id,
            email: userEmail,
          });
          if (response.success) {
            toast.success("Participant removed successfully");
            await loadExistingCommittee(webinar.id);
          } else {
            toast.error("Failed to remove participant");
          }
        } catch (error) {
          toast.error("Error removing participant");
        }
      },
    });
  };

  const getNewCommitteeMembers = () => {
    return editForm.panitia.filter(
      (email) =>
        !existingCommittee.some((member) => member.User.UserEmail === email),
    );
  };

  // --------- EDIT & SAVE ---------
  const handleSaveEditWebinar = async () => {
    if (!webinar) return;
    // Validate required fields
    if (
      !editForm.name ||
      !editForm.speaker ||
      !editForm.dateStart ||
      !editForm.timeStart ||
      !editForm.dateEnd ||
      !editForm.timeEnd ||
      !editForm.description ||
      editForm.max <= 0
    ) {
      toast.info("Please fill in all required fields", {
        toastId: "requiredFields",
      });
      return;
    }
    const fullStartDateTime = combineDateAndTime(
      editForm.dateStart,
      editForm.timeStart,
    );
    const fullEndDateTime = combineDateAndTime(
      editForm.dateEnd,
      editForm.timeEnd,
    );
    const startDate = new Date(fullStartDateTime);
    const endDate = new Date(fullEndDateTime);
    if (startDate >= endDate) {
      setError("End date must be after start date");
      toast.info("End date must be after start date", { toastId: "date-info" });
      return;
    }
    setError("");
    try {
      // Register new committee members first
      const newCommitteeMembers = getNewCommitteeMembers();
      if (newCommitteeMembers.length > 0) {
        let successCount = 0;
        let failCount = 0;
        for (const userEmail of newCommitteeMembers) {
          const user = panitiaData.find((u) => u.email === userEmail);
          if (user) {
            const success = await registEventParticipant(user);
            if (success) {
              successCount++;
            } else {
              failCount++;
            }
          } else {
            failCount++;
          }
        }
        if (successCount > 0) {
          toast.success(
            `${successCount} new committee members registered successfully!`,
          );
          await loadExistingCommittee(webinar.id);
        }
        if (failCount > 0) {
          toast.error(`${failCount} committee members failed to register`);
        }
      }

      // Saat save
      if (editForm.materialLink) {
        if (materialId) {
          await auth_material.edit_material({
            id: materialId,
            event_attach: editForm.materialLink,
          });
        } else {
          await auth_material.add_material({
            id: webinar.id,
            event_attach: editForm.materialLink,
          });
        }
      }

      // Update webinar data
      const editData = {
        id: webinar.id,
        name: editForm.name,
        desc: editForm.description,
        speaker: editForm.speaker,
        dstart: fullStartDateTime,
        dend: fullEndDateTime,
        link: editForm.link,
        img: editForm.imageUrl,
        max: editForm.max,
        att: editForm.att,
      };
      console.log("Updated Webinar that sended :", editData);
      const response = await auth_webinar.edit_webinar(editData);
      console.log("Updated Webinar :", response);

      if (response.success) {
        toast.success("Webinar updated successfully!", {
          toastId: "update-webinar",
        });
        setIsEditMode(false);
        setError("");
        await loadWebinarDetail(webinar.id);
      } else {
        toast.error("Failed to update webinar");
        return;
      }
    } catch (error) {
      toast.error("Failed to save changes. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    if (!webinar) return;
    setEditForm({
      name: webinar.name || "",
      description: webinar.description || "",
      speaker: webinar.speaker || "",
      dateStart: extractDate(webinar.dstart) || todayDate,
      timeStart: extractTime(webinar.dstart) || "00:00",
      dateEnd: extractDate(webinar.dend) || todayDate,
      timeEnd: extractTime(webinar.dend) || "00:00",
      att: webinar.att || "",
      link: webinar.link || "",
      imageUrl: webinar.imageUrl || "",
      max: webinar.max || 0,
      panitia: existingCommittee.map((member) => member.User.UserEmail),
      materialLink: materialLink || "",
    });
    setPreviewImage(
      webinar.imageUrl || "https://heroui.com/images/hero-card-complete.jpeg",
    );
    toast.info("Edit cancelled, changes reverted", { toastId: "cancelEdit" });
    setError("");
    setIsEditMode(false);
  };

  const handleDeleteMaterial = async () => {
    if (!materialId) {
      toast.error("No material to delete");
      return;
    }
    setShowConfirmModal({
      isOpen: true,
      title: "Delete Material",
      message: "Are you sure you want to delete this material?",
      type: "danger",
      onConfirm: async () => {
        setShowConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          const response = await auth_material.delete_material(materialId);
          if (response.success) {
            setMaterialId(null);
            setMaterialLink("");
            setEditForm((prev) => ({ ...prev, materialLink: "" }));
            toast.success("Material deleted successfully");
          } else {
            toast.error("Failed to delete material");
          }
        } catch (error) {
          toast.error("Error deleting material");
        }
      },
    });
  };

  // UI
  return (
    <DefaultLayout>
      <section>
        <div>
          <div className="flex flex-col items-center mb-2">
            {isWebinarFinished() && (
              <div className="w-full max-w-md bg-[#B6A3E8]/20 text-[#B6A3E8] font-semibold px-4 py-2 mb-3 rounded text-center">
                This webinar has already finished.
              </div>
            )}
            <div className="relative flex justify-center w-full max-w-md">
              <Image
                alt="Webinar banner"
                className="object-cover rounded-xl mx-auto"
                src={previewImage}
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
            <>
              <div className="flex flex-row gap-2 px-4 py-2 justify-center flex-wrap">
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
                      variant={isRegistered ? "solid" : "bordered"}
                      size="lg"
                      onClick={handleRegister}
                      isLoading={isRegistering}
                    >
                      {isRegistered ? "✓ Registered" : "Register"}
                    </Button>
                  )
                )}
                {!isCommittee ? (
                  webinar?.att === "online" ? (
                    <Button
                      className={buttonStyles({
                        color: hasAttended ? "success" : "secondary",
                        radius: "full",
                        variant:
                          isWebinarLive() && isRegistered
                            ? "solid"
                            : "bordered",
                        size: "lg",
                      })}
                      onClick={handleAbsence}
                    >
                      {hasAttended ? "✓ Attended" : "Check-in"}
                    </Button>
                  ) : (
                    <Button
                      color={hasAttended ? "success" : "secondary"}
                      radius="full"
                      variant={hasAttended ? "solid" : "bordered"}
                      size="lg"
                      isLoading={false}
                      onClick={handleGenerateQRAbsence}
                    >
                      {hasAttended ? "✓ Attended" : "Check-in"}
                    </Button>
                  )
                ) : (
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
                {isCommittee && (
                  <Button
                    className={buttonStyles({
                      color: "secondary",
                      radius: "full",
                      variant: "solid",
                      size: "lg",
                    })}
                    onClick={() => setIsEditMode(true)}
                  >
                    Edit Webinar
                  </Button>
                )}
              </div>
              {/* TAMPILAN DETAIL KHUSUS COMMITTEE (mirip admin, view only) */}
              {isCommittee && (
                <div className="px-4 py-4">
                  <h1 className="font-bold text-4xl mb-2">
                    {isLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      webinar?.name || "Webinar Series"
                    )}
                  </h1>
                  <div className="font-bold text-xl">
                    Speaker Name:{" "}
                    <span className="text-[#B6A3E8] font-bold">
                      {webinar?.speaker || "Speaker not available"}
                    </span>
                  </div>
                  <div className="font-bold text-xl">
                    Start Time:{" "}
                    <span className="text-[#B6A3E8] font-bold">
                      {formatDateDisplay(webinar?.dstart)}
                    </span>
                  </div>
                  <div className="font-bold text-xl">
                    End Time:{" "}
                    <span className="text-[#B6A3E8] font-bold">
                      {formatDateDisplay(webinar?.dend)}
                    </span>
                  </div>
                  <div className="font-bold text-xl">
                    {webinar?.att === "online"
                      ? "Webinar Link"
                      : "Webinar Location"}
                    :{" "}
                    <span className="text-[#B6A3E8] font-bold">
                      {webinar?.att === "online" && webinar?.link ? (
                        <a
                          href={webinar.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-[#6F2DBD]"
                        >
                          {webinar.link}
                        </a>
                      ) : (
                        webinar?.link || "Location not specified"
                      )}
                    </span>
                  </div>
                  {webinar?.max && (
                    <div className="font-bold text-xl">
                      Participants:{" "}
                      <span className="font-bold text-[#B6A3E8]">
                        {webinar.max}
                      </span>
                    </div>
                  )}
                  <div className="font-bold text-xl">
                    Attendance Type:{" "}
                    <span className="text-[#B6A3E8] font-bold">
                      {webinar?.att === "online"
                        ? "Online"
                        : webinar?.att === "offline"
                          ? "Offline"
                          : "Hybrid"}
                    </span>
                  </div>
                  <div className="font-bold text-xl">
                    Committee Members:{" "}
                    {isLoadingCommittee ? (
                      <span className="text-gray-500">Loading...</span>
                    ) : existingCommittee.length > 0 ? (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-2">
                          {existingCommittee.map((member, idx) => (
                            <Chip
                              key={member.User.UserEmail + idx}
                              color="secondary"
                              variant="flat"
                              size="sm"
                            >
                              {member.User.UserFullName} (
                              {member.User.UserEmail})
                            </Chip>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        No committee assigned
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-xl">
                    Material Link:{" "}
                    <span className="text-[#B6A3E8] font-bold">
                      {materialLink ? (
                        <a
                          href={materialLink}
                          className="underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Material
                        </a>
                      ) : (
                        "No material link"
                      )}
                    </span>
                  </div>
                  <div className="mt-2">
                    <h2 className="font-bold text-xl">Description:</h2>
                    <p className="text-justify text-lg leading-relaxed">
                      {webinar?.description || "Description not available"}
                    </p>
                  </div>
                </div>
              )}
              {/* END TAMPILAN DETAIL COMMITTEE */}
              {!isCommittee && (
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
                        formatDateDisplay(webinar?.dstart) ||
                        "No date specified"
                      )}
                    </span>
                  </div>
                  <div className="font-bold text-xl">
                    {webinar?.att === "online" ? "Venue " : "Lokasi "}:{" "}
                    <span className="text-[#B6A3E8] font-bold">
                      {webinar?.link ? (
                        <a
                          href={webinar.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#B6A3E8] font-bold hover:underline"
                        >
                          Webinar Link
                        </a>
                      ) : webinar?.att === "offline" ? (
                        webinar?.att || "Offline Event"
                      ) : (
                        "No location specified"
                      )}
                    </span>
                  </div>
                  {!isLoading && webinar?.speaker && (
                    <div className="font-bold text-xl">
                      Speaker :{" "}
                      <span className="text-[#B6A3E8] font-bold">
                        {webinar.speaker}
                      </span>
                    </div>
                  )}
                  {!isLoading && webinar?.max && webinar.max > 0 && (
                    <div className="font-bold text-xl">
                      Capacity :{" "}
                      <span className="text-[#B6A3E8] font-bold">
                        {webinar.max} participants
                      </span>
                    </div>
                  )}
                  <div>
                    <h1 className="font-bold text-xl">Description :</h1>
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
              )}
            </>
          ) : (
            <div className="flex justify-center items-center gap-2 mt-2 mb-4">
              <Button
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "solid",
                  size: "lg",
                })}
                onClick={handleSaveEditWebinar}
              >
                Save Changes
              </Button>
              <Button
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "solid",
                  size: "lg",
                })}
                onClick={handleCancelEdit}
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
                <Input
                  color="secondary"
                  label="Webinar Name"
                  placeholder="Enter webinar name"
                  value={editForm.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  isRequired
                />
                <Input
                  color="secondary"
                  label="Speaker Name"
                  placeholder="Enter speaker name"
                  value={editForm.speaker}
                  onChange={(e) => handleInputChange("speaker", e.target.value)}
                  isRequired
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Committee Members
                  </label>
                  {/* Tampilkan loading spinner jika loading committee */}
                  {isLoadingCommittee ? (
                    <div className="p-3 flex items-center gap-2">
                      <Spinner size="sm" color="secondary" />
                      <span className="text-gray-500">
                        Loading committee...
                      </span>
                    </div>
                  ) : (
                    <>
                      {existingCommittee.length > 0 && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Current Committee Members:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {existingCommittee.map((member, index) => {
                              return (
                                <div
                                  key={`existing-${member.User.UserEmail}-${member.User.UserId || index}`}
                                  className="flex items-center gap-2"
                                >
                                  <Chip
                                    color="success"
                                    variant="flat"
                                    size="sm"
                                  >
                                    {member.User.UserFullName || "Unknown"}
                                    <span className="text-xs ml-1">
                                      ({member.User.UserEmail || "No Email"})
                                    </span>
                                  </Chip>
                                  <Dropdown>
                                    <DropdownTrigger>
                                      <Button
                                        isIconOnly
                                        radius="full"
                                        size="sm"
                                        variant="light"
                                      >
                                        <VerticalDotsIcon />
                                      </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu>
                                      <DropdownItem
                                        key="normal"
                                        onPress={() =>
                                          handleChangeRole(
                                            member.User.UserEmail,
                                            "normal",
                                          )
                                        }
                                      >
                                        Change to Normal
                                      </DropdownItem>
                                      <DropdownItem
                                        key="remove"
                                        className="text-danger"
                                        onPress={() =>
                                          handleRemoveParticipant(
                                            member.User.UserEmail,
                                          )
                                        }
                                      >
                                        Remove from Event
                                      </DropdownItem>
                                    </DropdownMenu>
                                  </Dropdown>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <Select
                        color="secondary"
                        label="Select Committee Members"
                        placeholder={
                          isLoadingUsers
                            ? "Loading users..."
                            : "Choose committee members for this webinar"
                        }
                        selectionMode="multiple"
                        selectedKeys={editForm.panitia}
                        onSelectionChange={(keys) => {
                          const selectedEmails = Array.from(keys) as string[];
                          setEditForm((prev) => ({
                            ...prev,
                            panitia: selectedEmails,
                          }));
                        }}
                        className="w-full"
                        variant="bordered"
                        isDisabled={isLoadingUsers || isLoadingCommittee}
                      >
                        {panitiaData.map((user) => (
                          <SelectItem
                            key={user.email}
                            textValue={`${user.name} (${user.role})`}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {user.name}
                                {existingCommittee.some(
                                  (member) =>
                                    member.User.UserEmail === user.email,
                                ) && (
                                  <span className="text-green-600 text-xs ml-1">
                                    (Already assigned)
                                  </span>
                                )}
                              </span>
                              <span className="text-sm text-gray-500">
                                {user.role} - {user.email}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>
                      {editForm.panitia.length > 0 && (
                        <div className="text-sm text-gray-600">
                          Selected: {editForm.panitia.length} member(s)
                          {getNewCommitteeMembers().length > 0 && (
                            <span className="text-blue-600 ml-1">
                              ({getNewCommitteeMembers().length} new will be
                              registered when saved)
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    color="secondary"
                    label="Start Date"
                    type="date"
                    min={todayDate}
                    value={editForm.dateStart}
                    onChange={(e) =>
                      handleInputChange("dateStart", e.target.value)
                    }
                    isRequired
                  />
                  <Input
                    color="secondary"
                    label="Start Time"
                    type="time"
                    value={editForm.timeStart}
                    onChange={(e) => handleTimeChange("start", e.target.value)}
                    isRequired
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    color="secondary"
                    label="End Date"
                    type="date"
                    min={editForm.dateStart || todayDate}
                    value={editForm.dateEnd}
                    onChange={(e) =>
                      handleInputChange("dateEnd", e.target.value)
                    }
                    isRequired
                  />
                  <Input
                    color="secondary"
                    label="End Time"
                    type="time"
                    value={editForm.timeEnd}
                    onChange={(e) => handleTimeChange("end", e.target.value)}
                    isRequired
                  />
                </div>
                <Select
                  color="secondary"
                  label="Attendance Type"
                  selectedKeys={[editForm.att]}
                  onSelectionChange={(keys) => {
                    const [value] = Array.from(keys);
                    setEditForm((prev) => ({
                      ...prev,
                      att: value as string,
                    }));
                  }}
                  className="w-full"
                  variant="bordered"
                  isRequired
                >
                  <SelectItem key="online">Online</SelectItem>
                  <SelectItem key="offline">Offline</SelectItem>
                </Select>
                <Input
                  color="secondary"
                  label={
                    editForm.att === "online" ? "Webinar Link" : "Location"
                  }
                  placeholder={
                    editForm.att === "online" ? "https://..." : "Enter location"
                  }
                  value={editForm.link}
                  onChange={(e) => handleInputChange("link", e.target.value)}
                />
                <Input
                  color="secondary"
                  label="Webinar Image"
                  type="file"
                  accept="image/*"
                  onChange={handleWebinarImageUpload}
                  disabled={isImageLoading}
                  description="Maximum file size: 3MB. Supported formats: JPG, PNG, WebP"
                />
                <Input
                  color="secondary"
                  label="Maximum Participants"
                  type="number"
                  placeholder="Enter maximum number of participants"
                  value={editForm.max === 0 ? "" : editForm.max.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange(
                      "max",
                      value === "" ? 0 : parseInt(value) || 0,
                    );
                  }}
                  isRequired
                />
                <div className="relative w-full">
                  <Input
                    color="secondary"
                    label="Material (Google Drive Link, dsb)"
                    placeholder="https://drive.google.com/..."
                    value={editForm.materialLink}
                    onChange={(e) =>
                      handleInputChange("materialLink", e.target.value)
                    }
                    className="w-full pr-12"
                  />
                  {materialId && (
                    <button
                      type="button"
                      onClick={handleDeleteMaterial}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow"
                      disabled={isImageLoading}
                      aria-label="Delete material"
                      style={{ zIndex: 10 }}
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  )}
                </div>
                <Textarea
                  className="mt-4"
                  color="secondary"
                  label="Description"
                  placeholder="Enter webinar description"
                  value={editForm.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  minRows={4}
                  isRequired
                />
              </CardBody>
            </Card>
          ) : null}
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
        {showConfirmModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <FaExclamationTriangle
                  className={`text-xl ${
                    showConfirmModal.type === "danger"
                      ? "text-red-500"
                      : "text-yellow-500"
                  }`}
                />
                <h3 className="text-lg font-semibold">
                  {showConfirmModal.title}
                </h3>
              </div>
              <p className="text-gray-600 mb-6">{showConfirmModal.message}</p>
              <div className="flex gap-3 justify-end">
                <Button
                  color={
                    showConfirmModal.type === "danger" ? "danger" : "warning"
                  }
                  radius="full"
                  variant="solid"
                  size="sm"
                  onPress={showConfirmModal.onConfirm}
                >
                  {showConfirmModal.type === "danger"
                    ? "Remove"
                    : "Change Role"}
                </Button>
                <Button
                  color="default"
                  radius="full"
                  variant="bordered"
                  size="sm"
                  onPress={() =>
                    setShowConfirmModal((prev) => ({ ...prev, isOpen: false }))
                  }
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
      <ToastContainer />
    </DefaultLayout>
  );
}
