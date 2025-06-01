import { Input, Textarea } from "@heroui/input";
import { button as buttonStyles } from "@heroui/theme";
import { Image } from "@heroui/react";
import { useState } from "react";
import { auth } from "@/api/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";

// Fungsi untuk memformat tanggal sesuai kebutuhan backend
const formatDateForBackend = (dateString: string): string => {
  if (!dateString) return "";

  // Jika tanggal sudah dalam format ISO, tidak perlu diformat ulang
  if (dateString.includes("T")) return dateString;

  // Mengubah format yyyy-MM-dd menjadi yyyy-MM-ddT00:00:00Z (ISO string)
  return `${dateString}T00:00:00Z`;
};

// Type untuk attendance enum
type AttTypeEnum = "online" | "offline";

export function CreateWebinar() {
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

  const handleAttendanceChange = (value: AttTypeEnum) => {
    setWebinarInput({
      ...webinarInput,
      attendance: value,
    });
    setSelectedAttendance(value === "online" ? "Online" : "Offline");
  };

  const AddWebinar = async () => {
    setIsLoading(true);
    try {
      const formattedWebinarData = {
        name: webinarInput.name,
        image: webinarInput.image,
        dstart: formatDateForBackend(webinarInput.dstart),
        dend: formatDateForBackend(webinarInput.dend),
        speaker: webinarInput.speaker,
        att: webinarInput.attendance,
        link: webinarInput.link,
        max: webinarInput.max,
        desc: webinarInput.description,
      };

      const response = await auth.add_webinar(formattedWebinarData);

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
        case 4:
          setError("Webinar already exists with that name.");
          toast.info("Webinar already exists with that name.");
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

  // Fungsi untuk handle input perubahan waktu (jam:menit)
  const handleTimeChange = (field: "dstart" | "dend", value: string) => {
    const dateValue = webinarInput[field].split("T")[0];
    setWebinarInput({
      ...webinarInput,
      [field]: `${dateValue}T${value}:00Z`,
    });
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={buttonStyles()}>
        Add Webinar
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white mb-6 text-center">
                Create Webinar
              </h1>
              <div>
                <Image
                  className="object-cover rounded-lg mb-4"
                  alt="Preview Image Webinar"
                  src="https://heroui.com/images/hero-card-complete.jpeg"
                />

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
                    variant="flat"
                    className="w-full"
                    // TODO : Handle image Upload here
                    required
                  />
                  <Input
                    color="secondary"
                    label="Max Attendees"
                    type="number"
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

                  {/* Date Inputs - Now with separate date and time inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      color="secondary"
                      label="Date Start"
                      type="date"
                      variant="flat"
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
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => setIsOpen(false)}
                className={buttonStyles({
                  color: "danger",
                  radius: "full",
                  variant: "solid",
                  size: "md",
                })}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={AddWebinar}
                disabled={isLoading}
                className={buttonStyles({
                  color: "primary",
                  radius: "full",
                  variant: "solid",
                  size: "md",
                })}
              >
                {isLoading ? "Creating..." : "Create Webinar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
