import { Input, Textarea } from "@heroui/input";
import { Image } from "@heroui/react";
import { useState } from "react";
import { auth_webinar } from "@/api/auth_webinar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { PlusIcon } from "@/components/icons";

// Fungsi untuk memformat tanggal sesuai kebutuhan backend
const formatDateForBackend = (dateString: string): string => {
  if (!dateString) return "";

  // Jika tanggal sudah dalam format ISO, tidak perlu diformat ulang
  if (dateString.includes("T")) return dateString;

  // Mengubah format yyyy-MM-dd menjadi yyyy-MM-ddT00:00:00Z (ISO string)
  return `${dateString}T00:00:00Z`;
};

// Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Type untuk attendance enum
type AttTypeEnum = "online" | "offline";

export default function CreateWebinar() {
  const [webinarInput, setWebinarInput] = useState({
    name: "",
    image: "www.google.com",
    dstart: "",
    dend: "",
    speaker: "",
    attendance: "online" as AttTypeEnum,
    link: "",
    max: 0,
    description: "",
  });
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<string>("Online");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(
    "https://heroui.com/images/hero-card-complete.jpeg"
  );

  // Get today's date for min attribute
  const todayDate = getTodayDate();

  // Function to handle attendance type change, cause backend expects "online" or "offline"
  const handleAttendanceChange = (value: AttTypeEnum) => {
    setWebinarInput({
      ...webinarInput,
      attendance: value,
    });
    setSelectedAttendance(value === "online" ? "Online" : "Offline");
  };

  const AddWebinar = async () => {
    // Validasi input
    if (
      !webinarInput.name ||
      !webinarInput.dstart ||
      !webinarInput.dend ||
      !webinarInput.speaker ||
      !webinarInput.image ||
      !webinarInput.attendance ||
      !webinarInput.link ||
      !webinarInput.description ||
      webinarInput.max <= 0
    ) {
      setError("Please fill all required fields");
      toast.info("Please fill all required fields");
      return;
    }

    // Validasi tanggal
    const startDate = new Date(webinarInput.dstart);
    const endDate = new Date(webinarInput.dend);
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
      setError("End date must be after start date");
      toast.error("End date must be after start date");
      return;
    }

    setIsLoading(true);
    try {
      // Get Webinar Data
      const formattedWebinarData = {
        name: webinarInput.name,
        img: webinarInput.image,
        dstart: formatDateForBackend(webinarInput.dstart),
        dend: formatDateForBackend(webinarInput.dend),
        speaker: webinarInput.speaker,
        att: webinarInput.attendance,
        link: webinarInput.link,
        max: webinarInput.max,
        desc: webinarInput.description,
      };

      // Call API to add webinar
      const response = await auth_webinar.add_webinar(formattedWebinarData);

      // Server Side Success Handling
      if (response.success) {
        setError("");
        toast.success("Webinar Created Successfully!");
        navigate("/admin/webinar");
        window.location.reload();
        setIsOpen(false);
        return;
      }

      // Server Side Error Handling
      switch (response.error_code) {
        case 2:
          setError("You dont have permission to add webinar.");
          toast.error("You dont have permission to add webinar.");
          break;

        case 4:
          setError("Webinar already exists with that name.");
          toast.info("Webinar already exists with that name.");
          break;

        case 5:
          setError("Please fill all required fields.");
          toast.error("Please fill all required fields.");
          break;

        default:
          setError("Add Webinar Failed. Please contact support.");
          toast.error("Add Webinar Failed. Please contact support.");
          break;
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      toast.error("An error occurred");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle time change for start and end times
  const handleTimeChange = (field: "dstart" | "dend", value: string) => {
    const dateValue = webinarInput[field].split("T")[0];
    setWebinarInput({
      ...webinarInput,
      [field]: `${dateValue}T${value}:00Z`,
    });
  };

  // Function to handle webinar image upload
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

          // Simpan URL gambar ke state
          setWebinarInput({
            ...webinarInput,
            image: staticUrl,
          });

          // Update preview dengan URL final
          setPreviewImage(staticUrl);

          toast.success("Webinar Image Uploaded Successfully!");
        } else {
          setPreviewImage("https://heroui.com/images/hero-card-complete.jpeg");
          setError("Image upload failed. Please try again.");
          toast.error("Image upload failed. Please try again.");
        }
      } catch (error) {
        setPreviewImage("https://heroui.com/images/hero-card-complete.jpeg");
        setError("An error occurred while uploading the image.");
        toast.error("An error occurred while uploading the image.");
      } finally {
        setIsImageLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* ✅ Button dengan styling yang sama seperti User Management */}
      <Button
        className="bg-foreground text-background"
        endContent={<PlusIcon />}
        size="sm"
        onPress={() => setIsOpen(true)}
      >
        Add Webinar
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white mb-6 text-center">
                Create Webinar
              </h1>
              <div>
                <div className="flex items-center justify-center mb-4 relative">
                  {isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 rounded-lg">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  )}
                  <Image
                    className="object-cover rounded-lg w-full h-64"
                    alt="Preview Image Webinar"
                    src={previewImage}
                  />
                </div>

                <div className="space-y-4">
                  <Input
                    color="secondary"
                    label="Title"
                    type="text"
                    variant="flat"
                    className="w-full"
                    value={webinarInput.name}
                    onChange={(e) =>
                      setWebinarInput({
                        ...webinarInput,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                  <Input
                    color="secondary"
                    label="Image"
                    type="file"
                    accept="image/*"
                    variant="flat"
                    className="w-full"
                    onChange={handleWebinarImageUpload}
                    disabled={isImageLoading}
                    required
                  />
                  <Input
                    color="secondary"
                    label="Max Attendees"
                    type="number"
                    min={1}
                    variant="flat"
                    value={
                      webinarInput.max === 0 ? "" : webinarInput.max.toString()
                    }
                    className="w-full"
                    onChange={(e) => {
                      const value = e.target.value;
                      setWebinarInput({
                        ...webinarInput,
                        max: value === "" ? 0 : parseInt(value) || 0,
                      });
                    }}
                    required
                  />

                  {/* Date Inputs - Now with min attribute to disable past dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      color="secondary"
                      label="Date Start"
                      type="date"
                      variant="flat"
                      min={todayDate} // ✅ Disable tanggal sebelum hari ini
                      value={webinarInput.dstart.split("T")[0]}
                      className="w-full"
                      onChange={(e) =>
                        setWebinarInput({
                          ...webinarInput,
                          dstart: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      color="secondary"
                      label="Time Start"
                      type="time"
                      variant="flat"
                      className="w-full"
                      onChange={(e) =>
                        handleTimeChange("dstart", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      color="secondary"
                      label="Date End"
                      type="date"
                      variant="flat"
                      min={webinarInput.dstart.split("T")[0] || todayDate} // ✅ End date minimal sama dengan start date atau hari ini
                      value={webinarInput.dend.split("T")[0]}
                      className="w-full"
                      onChange={(e) =>
                        setWebinarInput({
                          ...webinarInput,
                          dend: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      color="secondary"
                      label="Time End"
                      type="time"
                      variant="flat"
                      className="w-full"
                      onChange={(e) => handleTimeChange("dend", e.target.value)}
                      required
                    />
                  </div>

                  <Input
                    color="secondary"
                    label="Speaker"
                    type="text"
                    variant="flat"
                    className="w-full"
                    value={webinarInput.speaker}
                    onChange={(e) =>
                      setWebinarInput({
                        ...webinarInput,
                        speaker: e.target.value,
                      })
                    }
                    required
                  />

                  <div className="w-full">
                    <label className="block text-sm font-medium mb-1.5 text-secondary-500 dark:text-secondary-500">
                      Attendance Type
                    </label>
                    <div className="relative">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button className="w-full justify-between h-[40px] px-3 py-2 text-left text-sm text-secondary-500 dark:text-secondary-300 bg-purple-100 dark:bg-purple-900/30 rounded-md border-none hover:bg-purple-200 dark:hover:bg-purple-800/40">
                            <span>{selectedAttendance}</span>
                            <span className="ml-auto">▼</span>
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Attendance Type"
                          variant="flat"
                          onAction={(key) =>
                            handleAttendanceChange(key as AttTypeEnum)
                          }
                          className="text-secondary-500 dark:text-secondary-300"
                        >
                          <DropdownItem
                            key="online"
                            className="text-secondary-500 dark:text-secondary-300"
                          >
                            Online
                          </DropdownItem>
                          <DropdownItem
                            key="offline"
                            className="text-secondary-500 dark:text-secondary-300"
                          >
                            Offline
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>

                  {/* Tampilkan Link Zoom hanya jika Online dipilih */}
                  {webinarInput.attendance === "online" && (
                    <Input
                      color="secondary"
                      label="Link Zoom (Online)"
                      type="text"
                      variant="flat"
                      className="w-full"
                      value={webinarInput.link}
                      onChange={(e) =>
                        setWebinarInput({
                          ...webinarInput,
                          link: e.target.value,
                        })
                      }
                      required
                    />
                  )}

                  {/* Tampilkan Location jika Offline dipilih */}
                  {webinarInput.attendance === "offline" && (
                    <Input
                      color="secondary"
                      label="Location (Offline)"
                      type="text"
                      variant="flat"
                      className="w-full"
                      value={webinarInput.link}
                      onChange={(e) =>
                        setWebinarInput({
                          ...webinarInput,
                          link: e.target.value,
                        })
                      }
                      required
                    />
                  )}

                  <Textarea
                    color="secondary"
                    label="Description Webinar"
                    type="text"
                    variant="flat"
                    className="w-full"
                    value={webinarInput.description}
                    onChange={(e) =>
                      setWebinarInput({
                        ...webinarInput,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              {error && <div className="text-red-500 mt-4">{error}</div>}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700 p-4">
              <Button
                color="danger"
                onPress={() => setIsOpen(false)}
                isDisabled={isLoading || isImageLoading}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={AddWebinar}
                isLoading={isLoading}
                isDisabled={isLoading || isImageLoading}
              >
                {isLoading ? "Creating..." : "Create Webinar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
