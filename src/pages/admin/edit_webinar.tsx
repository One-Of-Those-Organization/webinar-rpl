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
import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import DefaultLayout from "@/layouts/default_admin";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth_webinar } from "@/api/auth_webinar";
import { auth_user } from "@/api/auth_user";
import { auth_participants } from "@/api/auth_participants";
import { UserData } from "@/api/interface";
import { WebinarEdit } from "@/api/interface";
import { toast, ToastContainer } from "react-toastify";
import { FaExclamationTriangle } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

// Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Dropdown menu icon
const VerticalDotsIcon = () => (
  <svg
    fill="none"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
      fill="currentColor"
    />
  </svg>
);

export default function EditWebinarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Webinar data states
  const [webinarData, setWebinarData] = useState<WebinarEdit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);

  // User and committee states
  const [panitiaData, setPanitiaData] = useState<any[]>([]);
  const [existingCommittee, setExistingCommittee] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingCommittee, setIsLoadingCommittee] = useState(false);

  // Image upload states
  const [error, setError] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(
    "https://heroui.com/images/hero-card-complete.jpeg"
  );

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
    link: "",
    imageUrl: "",
    max: 0,
    eventmId: 0,
    certId: 0,
    panitia: [] as string[],
  });

  const todayDate = getTodayDate();

  // Load webinar data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        toast.error("Webinar ID not found");
        navigate("/admin/webinar");
        return;
      }

      try {
        setIsLoading(true);
        const result = await auth_webinar.get_webinar_by_id(parseInt(id));

        if (result.success) {
          const webinar = WebinarEdit.fromApiResponse(result.data);
          setWebinarData(webinar);

          setPreviewImage(
            webinar.img || "https://heroui.com/images/hero-card-complete.jpeg"
          );

          // Initialize form with webinar data
          setEditForm({
            name: webinar.name || "",
            description: webinar.desc || "",
            speaker: webinar.speaker || "",
            dateStart: webinar.dstart ? extractDate(webinar.dstart) : "",
            timeStart: webinar.dstart ? extractTime(webinar.dstart) : "",
            dateEnd: webinar.dend ? extractDate(webinar.dend) : "",
            timeEnd: webinar.dend ? extractTime(webinar.dend) : "",
            link: webinar.link || "",
            imageUrl: webinar.img || "",
            max: webinar.max || 0,
            eventmId: webinar.event_mat_id || 1,
            certId: webinar.cert_template_id || 1,
            panitia: webinar.panitia || [],
          });

          await loadExistingCommittee(parseInt(id));
          await get_webinar_count(parseInt(id));
        } else {
          toast.error("Failed to load webinar data");
          navigate("/admin/webinar");
        }
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
          (participant: any) => participant.EventPRole === "committee"
        );
        setExistingCommittee(committeeMembers);

        const existingEmails = committeeMembers.map(
          (member: any) => member.User.UserEmail
        );
        setEditForm((prev) => ({
          ...prev,
          panitia: existingEmails,
        }));
      }
    } catch (error) {
      console.error("Failed to load existing committee:", error);
    } finally {
      setIsLoadingCommittee(false);
    }
  };

  // Extract date from datetime string
  const extractDate = (dateTimeStr: string): string => {
    if (!dateTimeStr) return "";
    try {
      const date = new Date(dateTimeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (e) {
      return "";
    }
  };

  // Extract time from datetime string
  const extractTime = (dateTimeStr: string): string => {
    if (!dateTimeStr) return "";
    try {
      const date = new Date(dateTimeStr);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch (e) {
      return "";
    }
  };

  // Format date for display in UI
  const formatDateDisplay = (dateStr: string | undefined) => {
    if (!dateStr) return "Date not available";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number) => {
    const sanitizedValue = typeof value === "string" ? value.trim() : value;
    setEditForm((prev) => ({
      ...prev,
      [field]: sanitizedValue,
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

  // Combine date and time into ISO string
  const combineDateAndTime = (
    date: string,
    time: string,
    timezone = "UTC"
  ): string => {
    if (!date || !time) return "";
    const dateTime = new Date(`${date}T${time}:00`);
    return timezone === "UTC" ? dateTime.toISOString() : dateTime.toString();
  };

  // Handle webinar image upload
  const handleWebinarImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (3MB max)
    const maxSizeInBytes = 3 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError("Image size must be less than 3MB");
      toast.info("Image size must be less than 3MB");
      event.target.value = "";
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, JPEG, PNG, and WebP images are allowed");
      toast.info("Only JPG, JPEG, PNG, and WebP images are allowed");
      event.target.value = "";
      return;
    }

    setIsImageLoading(true);
    toast.info("Uploading Webinar Image...");
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
              "https://heroui.com/images/hero-card-complete.jpeg"
          );
          setError("Image upload failed. Please try again.");
          toast.error("Image upload failed. Please try again.");
        }
      } catch (error) {
        setPreviewImage(
          editForm.imageUrl ||
            "https://heroui.com/images/hero-card-complete.jpeg"
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
          `Failed to register user ${udata.UserFullName} (${udata.UserEmail}) as committee: ${response.message || "Unknown error"}`
        );
        return false;
      }
    } catch (error) {
      toast.error(
        `An error occurred while registering user ${udata.UserFullName} (${udata.UserEmail}) as committee`
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
      (member) => member.User.UserEmail === userEmail
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
      toast.info("Please fill in all required fields");
      return;
    }

    const fullStartDateTime = combineDateAndTime(
      editForm.dateStart,
      editForm.timeStart
    );
    const fullEndDateTime = combineDateAndTime(
      editForm.dateEnd,
      editForm.timeEnd
    );
    const startDate = new Date(fullStartDateTime);
    const endDate = new Date(fullEndDateTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time untuk perbandingan tanggal saja

    // Validasi tanggal tidak boleh sebelum hari ini
    if (startDate < today) {
      setError("Start date cannot be before today");
      toast.error("Start date cannot be before today");
      return;
    }

    if (endDate < today) {
      setError("End date cannot be before today");
      toast.error("End date cannot be before today");
      return;
    }

    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      setIsEditing(true);

      // Register new committee members first
      const newCommitteeMembers = getNewCommitteeMembers();
      if (newCommitteeMembers.length > 0) {
        toast.info(
          `Registering ${newCommitteeMembers.length} new committee members...`
        );

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
              webinarData.id
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
            `${successCount} new committee members registered successfully!`
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
        name: editForm.name.trim(),
        desc: editForm.description.trim(),
        speaker: editForm.speaker.trim(),
        dstart: fullStartDateTime,
        dend: fullEndDateTime,
        link: editForm.link.trim(),
        img: editForm.imageUrl.trim(),
        max: editForm.max,
        att: webinarData.att || "",
        event_mat_id: editForm.eventmId,
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
        editData.event_mat_id == webinarData.event_mat_id &&
        editData.cert_template_id == webinarData.cert_template_id
      );

      if (!hasWebinarChanges && newCommitteeMembers.length === 0) {
        toast.info("No changes detected");
        setIsEditing(false);
        return;
      }

      if (hasWebinarChanges) {
        const response = await auth_webinar.edit_webinar(editData);

        if (response.success) {
          toast.success("Webinar updated successfully!");

          // Update local webinar data
          const updatedWebinar = new WebinarEdit({
            ...webinarData,
            name: editForm.name.trim(),
            desc: editForm.description.trim(),
            speaker: editForm.speaker.trim(),
            dstart: fullStartDateTime,
            dend: fullEndDateTime,
            link: editForm.link.trim(),
            img: editForm.imageUrl.trim(),
            max: editForm.max,
            event_mat_id: editForm.eventmId,
            cert_template_id: editForm.certId,
          });

          setWebinarData(updatedWebinar);
        } else {
          toast.error("Failed to update webinar");
          return;
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
      link: webinarData.link || "",
      imageUrl: webinarData.img || "",
      max: webinarData.max || 0,
      eventmId: webinarData.event_mat_id || 1,
      certId: webinarData.cert_template_id || 1,
      panitia: existingCommittee.map((member) => member.User.UserEmail),
    });

    setPreviewImage(
      webinarData.img || "https://heroui.com/images/hero-card-complete.jpeg"
    );
    toast.info("Edit cancelled, changes reverted");
    setError("");
    setIsEditMode(false);
  };

  // Toggle edit mode
  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Get participant count for webinar
  const get_webinar_count = async (eventId: number) => {
    const response = await auth_participants.event_participate_count(eventId);
    try {
      if (response.success) {
        const count = response.data.count || 0;
        setParticipantCount(count);
        return count;
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
                <Link
                  className={buttonStyles({
                    color: "secondary",
                    radius: "full",
                    variant: "bordered",
                    size: "lg",
                  })}
                  href="#"
                >
                  Materials
                </Link>

                {webinarData.att === "online" && (
                  <Link
                    className={buttonStyles({
                      color: "secondary",
                      radius: "full",
                      variant: "ghost",
                      size: "lg",
                    })}
                    href={webinarData.link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Link
                  </Link>
                )}

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
            /* View mode display */
            <>
              <div className="mb-4">
                <h1 className="font-bold text-4xl mb-2">
                  {webinarData.name || "Webinar Series"}
                </h1>
              </div>

              <div className="space-y-3 mb-6">
                <div className="font-bold text-xl">
                  Speaker :{" "}
                  <span className="text-[#B6A3E8] font-bold">
                    {webinarData.speaker || "Speaker not available"}
                  </span>
                </div>

                <div className="font-bold text-xl">
                  Start Time :{" "}
                  <span className="text-[#B6A3E8] font-bold">
                    {formatDateDisplay(webinarData.dstart)}
                  </span>
                </div>

                <div className="font-bold text-xl">
                  End Time :{" "}
                  <span className="text-[#B6A3E8] font-bold">
                    {formatDateDisplay(webinarData.dend)}
                  </span>
                </div>

                <div className="font-bold text-xl">
                  {webinarData.att === "online" ? "Tempat" : "Lokasi Webinar"} :{" "}
                  <span className="text-[#B6A3E8] font-bold">
                    {webinarData.att === "online" ? "Online" : webinarData.link}
                  </span>
                </div>

                <div className="font-bold text-xl">
                  Max Participants :{" "}
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

                <div className="font-bold text-xl">
                  Current Attendees :{" "}
                  <span className="text-[#B6A3E8] font-bold">
                    {webinarData.att || "0"}
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

                <div className="font-bold text-xl">
                  Event Material ID :{" "}
                  <span className="text-[#B6A3E8] font-bold">
                    {webinarData.event_mat_id || "0"}
                  </span>
                </div>

                <div className="font-bold text-xl">
                  Certificate Template ID :{" "}
                  <span className="text-[#B6A3E8] font-bold">
                    {webinarData.cert_template_id || "0"}
                  </span>
                </div>

                {webinarData.link && webinarData.att === "online" && (
                  <div className="font-bold text-xl">
                    Webinar Link :{" "}
                    <a
                      href={webinarData.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#B6A3E8] font-bold hover:underline"
                    >
                      {webinarData.link}
                    </a>
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-bold text-xl mb-2">Description :</h2>
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

                {/* Basic info fields */}
                <Input
                  color="secondary"
                  label="Webinar Name *"
                  placeholder="Enter webinar name"
                  value={editForm.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  isRequired
                />

                <Input
                  color="secondary"
                  label="Speaker *"
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
                                        "normal"
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
                                        member.User.UserEmail
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    color="secondary"
                    label="Start Date *"
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
                    label="Start Time *"
                    type="time"
                    value={editForm.timeStart}
                    onChange={(e) => handleTimeChange("start", e.target.value)}
                    isRequired
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    color="secondary"
                    label="End Date *"
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
                    label="End Time *"
                    type="time"
                    value={editForm.timeEnd}
                    onChange={(e) => handleTimeChange("end", e.target.value)}
                    isRequired
                  />
                </div>

                {/* Additional fields */}
                <Input
                  color="secondary"
                  label={
                    webinarData.att === "online" ? "Webinar Link" : "Location"
                  }
                  placeholder={
                    webinarData.att === "online"
                      ? "https://..."
                      : "Enter location"
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
                  label="Maximum Participants *"
                  type="number"
                  placeholder="Enter maximum number of participants"
                  value={editForm.max === 0 ? "" : editForm.max.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange(
                      "max",
                      value === "" ? 0 : parseInt(value) || 0
                    );
                  }}
                  isRequired
                />

                {/* ID fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    color="secondary"
                    label="Event Material ID"
                    type="number"
                    placeholder="1"
                    min="1"
                    value={
                      editForm.eventmId === 0
                        ? ""
                        : editForm.eventmId.toString()
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange(
                        "eventmId",
                        value === "" ? 1 : parseInt(value) || 1
                      );
                    }}
                  />

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
                        value === "" ? 1 : parseInt(value) || 1
                      );
                    }}
                  />
                </div>

                {/* Description field */}
                <Textarea
                  color="secondary"
                  label="Description *"
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
              </div>
            </div>
          </div>
        )}
      </section>
      <ToastContainer />
    </DefaultLayout>
  );
}
