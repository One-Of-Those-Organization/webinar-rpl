import {
  Image,
  Button,
  Input,
  Textarea,
  Card,
  CardBody,
  Skeleton,
  Select,
  SelectItem,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { button as buttonStyles } from "@heroui/theme";
import DefaultLayout from "@/layouts/default_admin";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { auth_webinar } from "@/api/auth_webinar";
import { auth_user } from "@/api/auth_user";
import { auth_cert } from "@/api/auth_cert";
import { auth_participants } from "@/api/auth_participants";
import { auth_material } from "@/api/auth_material";
import { UserData } from "@/api/interface";
import { WebinarEdit } from "@/api/interface";
import { toast, ToastContainer } from "react-toastify";
import { VerticalDotsIcon } from "@/components/icons";
import { FaExclamationTriangle, FaTrash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { QRScanner } from "@/components/QRScanner";
import { API_URL } from "@/api/endpoint";
import {
  extractDate,
  extractTime,
  formatDateDisplay,
  combineDateAndTime,
} from "@/components/webinar_gaeroh";

// Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function EditWebinarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Webinar Data and related states
  const [webinarData, setWebinarData] = useState<WebinarEdit | null>(null);
  const [materialInfo, setMaterialInfo] = useState("");
  const [materialId, setMaterialId] = useState<number | null>(null);
  const [participantCount, setParticipantCount] = useState(0);

  // User and committee states
  const [panitiaData, setPanitiaData] = useState<any[]>([]);
  const [existingCommittee, setExistingCommittee] = useState<any[]>([]);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingCommittee, setIsLoadingCommittee] = useState(false);

  // Image upload states
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(
    "https://heroui.com/images/hero-card-complete.jpeg",
  );

  // Error state
  const [error, setError] = useState("");

  // QR Scanner state
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger" as "danger" | "warning",
  });

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

  const todayDate = getTodayDate();

  // Use effect to load webinar data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        toast.error("Webinar ID not found");
        navigate("/admin/webinar");
        return;
      }

      try {
        setIsLoading(true);

        // Get Webinar Data
        const result = await auth_webinar.get_webinar_by_id(parseInt(id));
        if (!result.success) {
          toast.error("Failed to load webinar data");
          navigate("/admin/webinar");
          return;
        }

        const webinar = WebinarEdit.fromApiResponse(result.data);
        setWebinarData(webinar);

        setPreviewImage(
          webinar.img || "https://heroui.com/images/hero-card-complete.jpeg",
        );

        // Load Existing Committee Members and Webinar Count
        await loadExistingCommittee(parseInt(id));
        await get_webinar_count(parseInt(id));

        // Load Material info
        const matRes = await auth_material.get_material(parseInt(id));
        let mat_parse = "";
        let mat_id: number | null = null;
        if (matRes.success && matRes.data) {
          mat_parse = matRes.data.EventMatAttachment || "";
          mat_id = matRes.data.ID || null;
        }
        setMaterialInfo(mat_parse);
        setMaterialId(mat_id);

        // Set initial form data
        setEditForm({
          name: webinar.name || "",
          description: webinar.desc || "",
          speaker: webinar.speaker || "",
          dateStart: webinar.dstart ? extractDate(webinar.dstart) : "",
          timeStart: webinar.dstart ? extractTime(webinar.dstart) : "",
          dateEnd: webinar.dend ? extractDate(webinar.dend) : "",
          timeEnd: webinar.dend ? extractTime(webinar.dend) : "",
          att: webinar.att || "",
          link: webinar.link || "",
          imageUrl: webinar.img || "",
          max: webinar.max || 0,
          certId: webinar.cert_template_id || 1,
          panitia: webinar.panitia || [],
          materialLink: mat_parse || "",
        });
      } catch (error) {
        toast.error("There was an error loading the webinar data");
        navigate("/admin/webinar");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  // Load users when entering edit mode
  useEffect(() => {
    if (isEditMode && panitiaData.length === 0) {
      handleFetchUser();
    }
  }, [isEditMode]);

  // Load existing committee members for webinar
  const loadExistingCommittee = async (eventId: any) => {
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

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle time field changes
  const handleTimeChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      setEditForm((prev) => ({ ...prev, timeStart: value }));
    } else {
      setEditForm((prev) => ({ ...prev, timeEnd: value }));
    }
  };

  // Handle webinar image upload
  const handleWebinarImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (3MB max)
    const maxSizeInBytes = 3 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError("Image size must be less than 3MB");
      toast.info("Image size must be less than 3MB", {
        toastId: "imageSizeError",
      });
      event.target.value = "";
      return;
    }

    // Validate file type
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

  // Fetch all users for committee selection
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

  // Register user as committee member
  const registEventParticipant = async (udata: UserData, eid: number) => {
    try {
      const requestData = {
        id: eid,
        email: udata.UserEmail,
        role: "committee",
      };

      const response =
        await auth_participants.event_participate_register(requestData);

      if (response.success) {
        return true;
      } else {
        toast.error(
          `Failed to register user ${udata.UserFullName} (${udata.UserEmail}) as committee: ${response.message || "Unknown error"}`,
        );
        return false;
      }
    } catch (error) {
      toast.error(
        `An error occurred while registering user ${udata.UserFullName} (${udata.UserEmail}) as committee`,
      );
      return false;
    }
  };

  // Change user role with confirmation
  const handleChangeRole = async (userEmail: string, newRole: string) => {
    if (!webinarData?.id) return;

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
              event_id: webinarData.id,
              email: userEmail,
              event_role: newRole,
            });

            if (response.success) {
              toast.success(`User role changed to ${newRole}`);
              await loadExistingCommittee(webinarData.id);
              await get_webinar_count(webinarData.id);
            } else {
              toast.error("Failed to change user role");
            }
          } catch (error) {
            toast.error("Error changing user role");
          }
        },
      });
    } else {
      // Direct call for other role changes
      try {
        const response = await auth_participants.event_participate_edit({
          event_id: webinarData.id,
          email: userEmail,
          event_role: newRole,
        });

        if (response.success) {
          toast.success(`User role changed to ${newRole}`);
          await loadExistingCommittee(webinarData.id);
          await get_webinar_count(webinarData.id);
        } else {
          toast.error("Failed to change user role");
        }
      } catch (error) {
        toast.error("Error changing user role");
      }
    }
  };

  // Remove participant with confirmation
  const handleRemoveParticipant = async (userEmail: string) => {
    if (!webinarData?.id) return;

    setShowConfirmModal({
      isOpen: true,
      title: "Remove Participant",
      message: `Are you sure you want to remove ${userEmail} from this webinar? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        setShowConfirmModal((prev) => ({ ...prev, isOpen: false }));

        try {
          const response = await auth_participants.event_participate_delete({
            event_id: webinarData.id,
            email: userEmail,
          });

          if (response.success) {
            toast.success("Participant removed successfully");
            await loadExistingCommittee(webinarData.id);
            await get_webinar_count(webinarData.id);
          } else {
            toast.error("Failed to remove participant");
          }
        } catch (error) {
          toast.error("Error removing participant");
        }
      },
    });
  };

  // Check if user is already a committee member
  const isUserAlreadyCommittee = (userEmail: string) => {
    return existingCommittee.some(
      (member) => member.User.UserEmail === userEmail,
    );
  };

  // Get new committee members that need registration
  const getNewCommitteeMembers = () => {
    return editForm.panitia.filter((email) => !isUserAlreadyCommittee(email));
  };

  // Save all webinar changes
  const handleSaveEdit = async () => {
    if (!webinarData) return;

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
    const today = new Date();

    // Validasi tanggal tidak boleh sebelum hari ini
    if (startDate <= today) {
      setError("Start date cannot be before today");
      toast.info("Start date cannot be before today", {
        toastId: "date-info",
      });
      return;
    } else if (endDate <= today) {
      setError("End date cannot be before today");
      toast.info("End date cannot be before today", { toastId: "date-info" });
      return;
    } else if (startDate >= endDate) {
      setError("End date must be after start date");
      toast.info("End date must be after start date", { toastId: "date-info" });
      return;
    } else {
      setError("");
    }

    try {
      setIsEditing(true);

      // Register new committee members first
      const newCommitteeMembers = getNewCommitteeMembers();
      if (newCommitteeMembers.length > 0) {
        // toast.info(
        //   `Registering ${newCommitteeMembers.length} new committee members...`,
        //   {
        //     toastId: "registeringCommittee",
        //   }
        // );

        let successCount = 0;
        let failCount = 0;

        for (const userEmail of newCommitteeMembers) {
          const user = panitiaData.find((u) => u.email === userEmail);

          if (user) {
            const userData: UserData = {
              UserId: user.id,
              UserEmail: user.email,
              UserFullName: user.name,
              UserRole: user.role,
              UserInstance: "",
              UserPicture: "",
              UserCreatedAt: "",
            };

            const success = await registEventParticipant(
              userData,
              webinarData.id,
            );
            if (success) {
              successCount++;
            } else {
              failCount++;
            }
          } else {
            failCount++;
          }
        }

        // Show registration results
        if (successCount > 0) {
          toast.success(
            `${successCount} new committee members registered successfully!`,
          );
          await loadExistingCommittee(webinarData.id);
        }
        if (failCount > 0) {
          toast.error(`${failCount} committee members failed to register`);
        }
      }

      // Update webinar data
      const editData = {
        id: webinarData.id || 0,
        name: editForm.name,
        desc: editForm.description,
        speaker: editForm.speaker,
        dstart: fullStartDateTime,
        dend: fullEndDateTime,
        link: editForm.link,
        img: editForm.imageUrl,
        max: editForm.max,
        att: editForm.att,
        material_link: editForm.materialLink,
        cert_template_id: editForm.certId,
      };

      // Check if webinar data has changed
      const hasWebinarChanges = !(
        editData.name == webinarData.name &&
        editData.speaker == webinarData.speaker &&
        editData.img == webinarData.img &&
        editData.link == webinarData.link &&
        editData.max == webinarData.max &&
        editData.dstart == webinarData.dstart &&
        editData.dend == webinarData.dend &&
        editData.desc == webinarData.desc &&
        editData.cert_template_id == webinarData.cert_template_id
      );

      if (
        !hasWebinarChanges &&
        newCommitteeMembers.length === 0 &&
        !editForm.materialLink
      ) {
        toast.info("No changes detected", { toastId: "noChanges" });
        setIsEditing(false);
        return;
      }

      if (hasWebinarChanges) {
        const response = await auth_webinar.edit_webinar(editData);

        if (response.success) {
          toast.success("Webinar updated successfully!", {
            toastId: "update-webinar",
          });

          // Update local webinar data
          const updatedWebinar = new WebinarEdit({
            ...webinarData,
            name: editForm.name,
            desc: editForm.description,
            speaker: editForm.speaker,
            dstart: fullStartDateTime,
            dend: fullEndDateTime,
            link: editForm.link,
            img: editForm.imageUrl,
            max: editForm.max,
            event_attach: editForm.materialLink,
            cert_template_id: editForm.certId,
          });

          setWebinarData(updatedWebinar);
        } else {
          toast.error("Failed to update webinar");
          return;
        }
      }

      if (editForm.materialLink) {
        if (materialId) {
          await auth_material.edit_material({
            id: materialId,
            event_attach: editForm.materialLink,
          });
          if (materialInfo !== editForm.materialLink) {
            toast.success("Material link updated!", {
              toastId: "update-webinar",
            });
          }
        } else {
          await auth_material.add_material({
            id: webinarData.id,
            event_attach: editForm.materialLink,
          });
          toast.success("Material link saved!", { toastId: "update-webinar" });
        }
      }

      // Exit edit mode
      setIsEditMode(false);
      setError("");

      if (hasWebinarChanges || newCommitteeMembers.length > 0) {
        await get_webinar_count(webinarData.id);
      }
    } catch (error) {
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  // Cancel editing and revert changes
  const handleCancelEdit = () => {
    if (!webinarData) return;

    // Reset form to original data
    setEditForm({
      name: webinarData.name || "",
      description: webinarData.desc || "",
      speaker: webinarData.speaker || "",
      dateStart: webinarData.dstart ? extractDate(webinarData.dstart) : "",
      timeStart: webinarData.dstart ? extractTime(webinarData.dstart) : "",
      dateEnd: webinarData.dend ? extractDate(webinarData.dend) : "",
      timeEnd: webinarData.dend ? extractTime(webinarData.dend) : "",
      att: webinarData.att || "",
      link: webinarData.link || "",
      imageUrl: webinarData.img || "",
      max: webinarData.max || 0,
      certId: webinarData.cert_template_id || 1,
      panitia: existingCommittee.map((member) => member.User.UserEmail),
      materialLink: materialInfo || "",
    });

    setPreviewImage(
      webinarData.img || "https://heroui.com/images/hero-card-complete.jpeg",
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
            setMaterialInfo("");
            setMaterialId(null);
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

  // Toggle edit mode
  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Handle QR scanner open
  const handleQRScan = () => {
    setIsQRScannerOpen(true);
  };

  // Handle certificate click
  const handleCertificateClick = async () => {
    const token = localStorage.getItem("token");
    const _ = await auth_cert.create_cert(parseInt(id || "0"));
    document.cookie = `jwt=${token}; path=/; Secure`;
    const link = `${API_URL}/api/c/cert-editor?event_id=${id}`;
    window.open(link, "_blank", "noopener,noreferrer");
  };

  // Get participant count for webinar
  const get_webinar_count = async (eventId: number) => {
    const response = await auth_participants.event_participate_count(eventId);
    try {
      if (response.success) {
        setParticipantCount(
          typeof response.data === "number" ? response.data : 0,
        );
      } else {
        toast.error("Failed to fetch participant count");
        return 0;
      }
    } catch (error) {
      toast.error("Error fetching participant count");
      return 0;
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <DefaultLayout>
        <section>
          <div className="space-y-4">
            <Skeleton className="rounded-xl">
              <div className="h-64 rounded-xl bg-default-300"></div>
            </Skeleton>
            <div className="space-y-3">
              <Skeleton className="w-3/5 rounded-lg">
                <div className="h-8 w-3/5 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-4/5 rounded-lg">
                <div className="h-6 w-4/5 rounded-lg bg-default-200"></div>
              </Skeleton>
              <Skeleton className="w-2/5 rounded-lg">
                <div className="h-6 w-2/5 rounded-lg bg-default-300"></div>
              </Skeleton>
            </div>
          </div>
        </section>
      </DefaultLayout>
    );
  }

  // No data found
  if (!webinarData) {
    return (
      <DefaultLayout>
        <section>
          <Card>
            <CardBody className="text-center py-10">
              <h3 className="text-lg font-semibold text-danger">
                Webinar Not Found
              </h3>
              <p className="text-gray-500 mt-2">
                Webinar data with ID {id} could not be found.
              </p>
              <Button
                color="primary"
                className="mt-4"
                onPress={() => navigate("/admin/webinar")}
              >
                Back to Dashboard
              </Button>
            </CardBody>
          </Card>
        </section>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section>
        {/* Image header section */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative">
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 rounded-xl z-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            )}
            <Image
              alt="Webinar image"
              className="object-cover rounded-xl mx-auto"
              src={previewImage}
              height={300}
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-row gap-2 px-4 py-4 justify-center">
            {!isEditMode ? (
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

                <Link
                  className={buttonStyles({
                    color: "secondary",
                    radius: "full",
                    variant: "bordered",
                    size: "lg",
                  })}
                  to={"/"} // STILL DUMMY LINK
                >
                  View Participants
                </Link>

                <Button
                  className={buttonStyles({
                    color: "secondary",
                    radius: "full",
                    variant: "bordered",
                    size: "lg",
                  })}
                  onClick={handleCertificateClick}
                >
                  Certificate
                </Button>

                <Button
                  color="secondary"
                  radius="full"
                  size="lg"
                  onPress={handleToggleEditMode}
                >
                  Edit Webinar
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="primary"
                  radius="full"
                  size="lg"
                  onPress={handleSaveEdit}
                  isLoading={isEditing}
                  isDisabled={isEditing || isImageLoading}
                >
                  {isEditing ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  color="default"
                  variant="bordered"
                  radius="full"
                  size="lg"
                  onPress={handleCancelEdit}
                  isDisabled={isEditing || isImageLoading}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="px-4 py-2">
          {!isEditMode ? (
            <>
              {/* Webinar Name */}
              <h1 className="font-bold text-4xl">
                {webinarData.name || "Webinar Series"}
              </h1>

              {/* Webinar Speaker */}
              <div>
                <div className="font-bold text-xl">
                  Speaker Name :{" "}
                  <span className="text-[#B6A3E8] font-bold">
                    {webinarData.speaker || "Speaker not available"}
                  </span>
                </div>

                {/* Webinar Start Date */}
                <div className="font-bold text-xl">
                  Start Time :{" "}
                  <span className="text-[#B6A3E8] font-bold">
                    {formatDateDisplay(webinarData.dstart)}
                  </span>
                </div>

                {/* Webinar End Date */}
                <div className="font-bold text-xl">
                  End Time :{" "}
                  <span className="text-[#B6A3E8] font-bold">
                    {formatDateDisplay(webinarData.dend)}
                  </span>
                </div>

                {/* Webinar Precise Location */}
                <div className="font-bold text-xl">
                  {webinarData.att === "online"
                    ? "Webinar Link"
                    : "Webinar Location"}{" "}
                  :{" "}
                  <span className="text-[#B6A3E8] font-bold">
                    {webinarData.att === "online" ? (
                      <a
                        href={webinarData.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-[#6F2DBD]"
                      >
                        Link
                      </a>
                    ) : (
                      "Location not specified"
                    )}
                  </span>
                </div>

                {/* Webinar Participants Count */}
                <div className="font-bold text-xl">
                  Participants :{" "}
                  <span
                    className={`font-bold ${
                      participantCount >= (webinarData.max || 0) * 0.9
                        ? "text-red-500"
                        : "text-[#B6A3E8]"
                    }`}
                  >
                    {participantCount}/{webinarData.max || "∞"}
                    {participantCount >= (webinarData.max || 0) && (
                      <span className="text-red-500 text-sm ml-2">⚠️ Full</span>
                    )}
                  </span>
                </div>

                {/* Webinar Attendance Type */}
                <div className="font-bold text-xl">
                  Attendance Type :{" "}
                  <span className="text-[#B6A3E8] font-bold">
                    {webinarData.att === "online"
                      ? "Online"
                      : webinarData.att === "offline"
                        ? "Offline"
                        : "Hybrid"}
                  </span>
                </div>

                {/* Committee members display */}
                <div className="font-bold text-xl">
                  Committee Members :{" "}
                  {isLoadingCommittee ? (
                    <span className="text-gray-500">Loading...</span>
                  ) : existingCommittee.length > 0 ? (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {existingCommittee.map((member, index) => (
                          <Chip
                            key={index}
                            color="secondary"
                            variant="flat"
                            size="sm"
                          >
                            {member.User.UserFullName} ({member.User.UserEmail})
                          </Chip>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">No committee assigned</span>
                  )}
                </div>

                {/* Webinar material link display */}
                <div className="font-bold text-xl">
                  Material Link :{" "}
                  <span className="text-[#B6A3E8] font-bold">
                    {materialInfo ? (
                      <a
                        href={materialInfo}
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

                {/* Webinar Certificate */}
                <div className="font-bold text-xl">
                  Certificate Template ID :{" "}
                  <span className="text-[#B6A3E8] font-bold">
                    {webinarData.cert_template_id || "0"}
                  </span>
                </div>
              </div>

              {/* Webinar Description section */}
              <div>
                <h2 className="font-bold text-xl">Description :</h2>
                <p className="text-justify text-lg leading-relaxed">
                  {webinarData.desc || "Description not available"}
                </p>
              </div>
            </>
          ) : (
            /* Edit mode form */
            <Card>
              <CardBody className="space-y-4">
                <h2 className="font-bold text-2xl mb-4">Edit Webinar</h2>

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

                {/* Committee management section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Committee Members
                  </label>

                  {/* Current committee display */}
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
                              <Chip color="success" variant="flat" size="sm">
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

                  {/* Committee selection dropdown */}
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
                    isDisabled={isLoadingUsers}
                  >
                    {panitiaData.map((user) => (
                      <SelectItem
                        key={user.email}
                        textValue={`${user.name} (${user.role})`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {user.name}
                            {isUserAlreadyCommittee(user.email) && (
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

                  {/* Selection info */}
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
                </div>

                {/* Edit Webinar Start Date */}
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

                  {/* Edit Webinar Start Time */}
                  <Input
                    color="secondary"
                    label="Start Time"
                    type="time"
                    value={editForm.timeStart}
                    onChange={(e) => handleTimeChange("start", e.target.value)}
                    isRequired
                  />
                </div>

                {/* Edit Webinar End Date */}
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
                  {/* Edit Webinar End Time */}
                  <Input
                    color="secondary"
                    label="End Time"
                    type="time"
                    value={editForm.timeEnd}
                    onChange={(e) => handleTimeChange("end", e.target.value)}
                    isRequired
                  />
                </div>

                {/* Edit Webinar Attendance Type */}
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

                {/* Edit Webinar Precise Location */}
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

                {/* Edit Webinar Poster */}
                <Input
                  color="secondary"
                  label="Webinar Image"
                  type="file"
                  accept="image/*"
                  onChange={handleWebinarImageUpload}
                  disabled={isImageLoading}
                  description="Maximum file size: 3MB. Supported formats: JPG, PNG, WebP"
                />

                {/* Edit Webinar Maximum Participants */}
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

                {/* Edit Webinar Certificate */}
                <Input
                  color="secondary"
                  label="Certificate Template ID"
                  type="number"
                  placeholder="1"
                  min="1"
                  value={
                    editForm.certId === 0 ? "" : editForm.certId.toString()
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange(
                      "certId",
                      value === "" ? 1 : parseInt(value) || 1,
                    );
                  }}
                />

                {/* Edit Webinar Material */}
                <div className="relative w-full">
                  <Input
                    color="secondary"
                    label="Material (Google Drive Link, dsb)"
                    placeholder="https://drive.google.com/..."
                    value={editForm.materialLink}
                    onChange={(e) =>
                      handleInputChange("materialLink", e.target.value)
                    }
                    className="w-full pr-12" // beri padding kanan untuk icon
                  />
                  {materialId && (
                    <button
                      type="button"
                      onClick={handleDeleteMaterial}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow"
                      disabled={isEditing}
                      aria-label="Delete material"
                      style={{ zIndex: 10 }}
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  )}
                </div>

                {/* Edit Webinar Description */}
                <Textarea
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
          )}
        </div>

        {/* Confirmation modal */}
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

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />

      <ToastContainer />
    </DefaultLayout>
  );
}
