import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import DefaultLayout from "@/layouts/default_admin";
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
} from "@heroui/react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth_webinar } from "@/api/auth_webinar";
import { WebinarEdit } from "@/api/interface";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Edit Webinar Page

export default function EditWebinarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // States untuk data webinar
  const [webinarData, setWebinarData] = useState<WebinarEdit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // States tambahan untuk image upload (sama seperti AddWebinar)
  const [error, setError] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(
    "https://heroui.com/images/hero-card-complete.jpeg"
  );

  // States untuk form editing
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    speaker: "",
    organizers: [] as string[], // New field for organizers/panitia
    dateStart: "",
    timeStart: "",
    dateEnd: "",
    timeEnd: "",
    link: "",
    imageUrl: "",
    max: 0,
    eventmId: 0,
    certId: 0,
  });

  // Mock data untuk organizers - ini bisa diganti dengan API call
  const availableOrganizers = [
    { id: "1", name: "John Doe", role: "Admin" },
    { id: "2", name: "Jane Smith", role: "Coordinator" },
    { id: "3", name: "Bob Wilson", role: "Moderator" },
    { id: "4", name: "Alice Johnson", role: "Technical Support" },
    { id: "5", name: "Mike Brown", role: "Content Manager" },
  ];

  // Load data webinar saat component mount
  useEffect(() => {
    const loadWebinarData = async () => {
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

          // Set preview image
          setPreviewImage(
            webinar.img || "https://heroui.com/images/hero-card-complete.jpeg"
          );

          // Set form data
          setEditForm({
            name: webinar.name || "",
            description: webinar.desc || "",
            speaker: webinar.speaker || "",
            organizers: [], // Load from API if available
            dateStart: webinar.dstart ? extractDate(webinar.dstart) : "",
            timeStart: webinar.dstart ? extractTime(webinar.dstart) : "",
            dateEnd: webinar.dend ? extractDate(webinar.dend) : "",
            timeEnd: webinar.dend ? extractTime(webinar.dend) : "",
            link: webinar.link || "",
            imageUrl: webinar.img || "",
            max: webinar.max || 0,
            eventmId: webinar.event_mat_id || 1,
            certId: webinar.cert_template_id || 1,
          });
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

    loadWebinarData();
  }, [id, navigate]);

  // Function untuk extract date dari datetime string
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

  // Function untuk extract time dari datetime string
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

  // Function untuk format tanggal display
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

  // Function untuk handle form input changes
  const handleInputChange = (
    field: string,
    value: string | number | string[]
  ) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Function untuk handle time change (sama seperti AddWebinar)
  const handleTimeChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      setEditForm((prev) => ({
        ...prev,
        timeStart: value,
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        timeEnd: value,
      }));
    }
  };

  // Function untuk combine date dan time
  const combineDateAndTime = (date: string, time: string): string => {
    if (!date || !time) return "";
    return `${date}T${time}:00Z`;
  };

  // Function to handle webinar image upload (sama seperti AddWebinar tapi disesuaikan)
  const handleWebinarImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validasi ukuran file (3MB = 3 * 1024 * 1024 bytes)
    const maxSizeInBytes = 3 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError("Image size must be less than 3MB");
      toast.info("Image size must be less than 3MB");
      event.target.value = "";
      return;
    }

    // Validasi tipe file (opsional, tapi recommended)
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

      // Set preview langsung dengan base64 untuk UX yang lebih baik
      setPreviewImage(base64Image);

      try {
        const response = await auth_webinar.post_webinar_image({
          data: base64Image,
        });

        if (response.success) {
          let serverPath = response.data?.filename || response.data;

          const staticUrl = serverPath;

          // Simpan URL gambar ke editForm.imageUrl (sesuai EditWebinarPage)
          setEditForm((prev) => ({
            ...prev,
            imageUrl: staticUrl,
          }));

          // Update preview dengan URL final
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

  // Function untuk save edit webinar
  const handleSaveEdit = async () => {
    if (!webinarData) return;

    // Validasi form
    if (!editForm.name.trim()) {
      toast.info("Webinar name cannot be empty");
      return;
    }

    if (!editForm.speaker.trim()) {
      toast.info("Speaker name cannot be empty");
      return;
    }

    if (!editForm.dateStart) {
      toast.info("Start date cannot be empty");
      return;
    }

    if (!editForm.timeStart) {
      toast.info("Start time cannot be empty");
      return;
    }

    if (!editForm.dateEnd) {
      toast.info("End date cannot be empty");
      return;
    }

    if (!editForm.timeEnd) {
      toast.info("End time cannot be empty");
      return;
    }

    if (!editForm.description.trim()) {
      toast.info("Description cannot be empty");
      return;
    }

    if (editForm.max <= 0) {
      toast.info("Maximum participants must be greater than 0");
      return;
    }

    // Validasi tanggal
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

    if (startDate >= endDate) {
      toast.info("End date must be after start date");
      return;
    }

    try {
      setIsEditing(true);

      // Buat object sesuai dengan WebinarEdit class
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
        // organizers: editForm.organizers, // Add to API call if supported
      };

      if (
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
      ) {
        toast.info("No changes detected, no update made");
        setIsEditing(false);
        return;
      }

      const response = await auth_webinar.edit_webinar(editData);

      if (response.success) {
        toast.success("Webinar updated successfully!");
        // Update local data menggunakan WebinarEdit constructor
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
        setIsEditMode(false);
        setError("");
      } else {
        toast.error("Failed to update webinar");
      }
    } catch (error) {
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  // Function untuk cancel edit
  const handleCancelEdit = () => {
    if (!webinarData) return;

    // Reset form ke data original
    setEditForm({
      name: webinarData.name || "",
      description: webinarData.desc || "",
      speaker: webinarData.speaker || "",
      organizers: [], // Reset organizers
      dateStart: webinarData.dstart ? extractDate(webinarData.dstart) : "",
      timeStart: webinarData.dstart ? extractTime(webinarData.dstart) : "",
      dateEnd: webinarData.dend ? extractDate(webinarData.dend) : "",
      timeEnd: webinarData.dend ? extractTime(webinarData.dend) : "",
      link: webinarData.link || "",
      imageUrl: webinarData.img || "",
      max: webinarData.max || 0,
      eventmId: webinarData.event_mat_id || 1,
      certId: webinarData.cert_template_id || 1,
    });

    // Reset preview image juga
    setPreviewImage(
      webinarData.img || "https://heroui.com/images/hero-card-complete.jpeg"
    );
    toast.info("Edit cancelled, changes reverted");
    setError("");
    setIsEditMode(false);
  };

  // Function untuk toggle edit mode
  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Loading state
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

  // If no webinar data found
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
        {/* Header dengan Image */}
        <div className="mb-6 flex flex-col items-center">
          {/* Display preview image dengan loading indicator */}
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

          {/* Action Buttons */}
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
                <Link
                  className={buttonStyles({
                    color: "secondary",
                    radius: "full",
                    variant: "ghost",
                    size: "lg",
                  })}
                  href={webinarData.link || "#"}
                  target="_blank"
                >
                  Link
                </Link>
                <Link
                  className={buttonStyles({
                    color: "secondary",
                    radius: "full",
                    variant: "ghost",
                    size: "lg",
                  })}
                  href="#"
                >
                  Attendees
                </Link>
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
                  color="warning"
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

        {/* Content */}
        <div className="px-4 py-2">
          {!isEditMode ? (
            /* View Mode */
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
                  Max Participants :{" "}
                  <span className="text-[#B6A3E8] font-bold">
                    {webinarData.max || "Unlimited"}
                  </span>
                </div>

                <div className="font-bold text-xl">
                  Current Attendees :{" "}
                  <span className="text-[#B6A3E8] font-bold">
                    {webinarData.att || "0"}
                  </span>
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

                {webinarData.link && (
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
            /* Edit Mode */
            <Card>
              <CardBody className="space-y-4">
                <h2 className="font-bold text-2xl mb-4">Edit Webinar</h2>

                {/* Error display */}
                {error && (
                  <div className="text-red-500 text-sm mb-4">{error}</div>
                )}

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

                {/* Organizers/Panitia Field - NEW */}
                <Select
                  color="secondary"
                  label="Organizers/Committee"
                  placeholder="Select organizers"
                  selectionMode="multiple"
                  selectedKeys={editForm.organizers}
                  onSelectionChange={(keys) => {
                    const selectedArray = Array.from(keys as Set<string>);
                    handleInputChange("organizers", selectedArray);
                  }}
                >
                  {availableOrganizers.map((organizer) => (
                    <SelectItem key={organizer.id}>
                      {organizer.name} ({organizer.role})
                    </SelectItem>
                  ))}
                </Select>

                {/* Selected Organizers Display */}
                {editForm.organizers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Selected Organizers:</p>
                    <div className="flex flex-wrap gap-2">
                      {editForm.organizers.map((organizerId) => {
                        const organizer = availableOrganizers.find(
                          (org) => org.id === organizerId
                        );
                        return (
                          <div
                            key={organizerId}
                            className="bg-secondary-100 text-secondary-600 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            {organizer?.name} ({organizer?.role})
                            <button
                              type="button"
                              onClick={() => {
                                const newOrganizers =
                                  editForm.organizers.filter(
                                    (id) => id !== organizerId
                                  );
                                handleInputChange("organizers", newOrganizers);
                              }}
                              className="text-secondary-500 hover:text-secondary-700"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Date Start - Pisah date dan time seperti AddWebinar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    color="secondary"
                    label="Start Date *"
                    type="date"
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

                <Input
                  color="secondary"
                  label="Webinar Link"
                  placeholder="https://..."
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

                {/* Event Material ID dan Certificate Template ID */}
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
      </section>

      <ToastContainer />
    </DefaultLayout>
  );
}
