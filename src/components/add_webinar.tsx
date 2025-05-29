import { Input } from "@heroui/input";
import { button as buttonStyles } from "@heroui/theme";
import { Image } from "@heroui/react";
import { useState } from "react";
import { auth } from "@/api/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function CreateWebinar() {
  const [webinarInput, setWebinarInput] = useState({
    name: "",
    image: "",
    date: "",
    place: "",
    materi: "",
    link: "",
    description: "",
  });
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const AddWebinar = async () => {
    setIsLoading(true);
    try {
      // TODO API call to fetch webinar
      const response = await auth.add_webinar(webinarInput);
      if (response.success === true) {
        setError("");
        toast.success("Webinar Created Successfully!");
        navigate("/dashboard");
        return;
      } else {
        setError("Failed to create webinar. Please try again.");
        toast.error("Failed to create webinar");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
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
                    label="Date"
                    type="date"
                    variant="flat"
                    value={webinarInput.date}
                    className="w-full"
                    onChange={(e) =>
                      setWebinarInput({
                        ...webinarInput,
                        date: e.target.value,
                      })
                    }
                    required
                  />
                  <Input
                    color="secondary"
                    label="Place"
                    type="text"
                    variant="flat"
                    className="w-full"
                    value={webinarInput.place}
                    onChange={(e) =>
                      setWebinarInput({
                        ...webinarInput,
                        place: e.target.value,
                      })
                    }
                    required
                  />
                  <Input
                    color="secondary"
                    label="Materi"
                    type="file"
                    variant="flat"
                    className="w-full"
                    // TODO : Handle materi Upload here
                  />
                  <Input
                    color="secondary"
                    label="Link"
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
                  />
                  <Input
                    color="secondary"
                    label="Description"
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
            </div>

            {/* Show error message if any */}
            {error && <div className="text-red-500 mt-4">{error}</div>}

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
