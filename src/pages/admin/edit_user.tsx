import { button as buttonStyles } from "@heroui/theme";
import DefaultLayout from "@/layouts/default_admin";
import { Image, Button } from "@heroui/react";
import { Input } from "@heroui/input";
import { FaCamera, FaExclamationTriangle } from "react-icons/fa";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth_user } from "@/api/auth_user";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EditUserPage() {
  const navigate = useNavigate();
  const { email } = useParams<{ email: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Ref untuk input file
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Checkpoint for original data
  const [originalData, setOriginalData] = useState({
    name: "",
    email: "",
    instance: "",
    picture: "",
    joinDate: "",
  });

  // User Data State that will be edited and sended to the API
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    instance: "",
    picture: "",
    joinDate: "",
  });

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges =
      userData.name !== originalData.name ||
      userData.instance !== originalData.instance ||
      userData.picture !== originalData.picture;
    setHasUnsavedChanges(hasChanges);
  }, [userData, originalData]);

  // Handle Escape key to cancel editing
  useEffect(() => {
    const handleKeyPress = (e: any) => {
      if (e.key === "Escape" && isEditing) handleCancelClick();
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isEditing]);

  // Load user data when the component mounts or email changes
  useEffect(() => {
    if (!email) {
      toast.error("User email is required or invalid");
      navigate("/admin/user");
      return;
    }

    const loadUserData = async () => {
      try {
        setIsEditing(false);
        const decodedEmail = decodeURIComponent(email);
        const response = await auth_user.get_user_by_email(decodedEmail);

        if (response.success && response.data) {
          const dataToSet = {
            name: response.data.UserFullName || "",
            email: response.data.UserEmail || "",
            instance: response.data.UserInstance || "",
            picture: response.data.UserPicture || "",
            joinDate: response.data.UserCreatedAt || "",
          };
          setUserData(dataToSet);
          setOriginalData(dataToSet);
        } else {
          toast.error("Failed to load user data");
          navigate("/admin/user");
        }
      } catch (error) {
        toast.error("Error loading user data");
        navigate("/admin/user");
      }
    };

    loadUserData();
  }, [email, navigate]);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB");
        // Reset input file
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Validasi tipe file
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPG, PNG, GIF)");
        // Reset input file
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result as string;
        handleInputChange("picture", result);
        toast.success("Image selected!");
      };

      reader.onerror = () => {
        toast.error("Failed to read the image file");
        // Reset input file
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };

      reader.readAsDataURL(file);
    }
  };

  // Handle remove image
  const handleRemoveImage = useCallback(() => {
    // Clear profile state
    handleInputChange("picture", "");

    // Reset input file value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.files = null;
    }

    // Clear any potential cached data
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.type = "";
        fileInputRef.current.type = "file";
      }
    }, 0);

    toast.success("Image removed successfully");
  }, []);

  // Handle camera click
  const handleCameraClick = useCallback(() => {
    if (fileInputRef.current && isEditing) {
      fileInputRef.current.click();
    }
  }, [isEditing]);

  // Handle saving user data
  const handleSave = async () => {
    if (!userData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    if (!userData.instance.trim()) {
      toast.error("Instance cannot be empty");
      return;
    }

    if (!hasUnsavedChanges) {
      toast.info("No changes detected, nothing to save");
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      const response = await auth_user.user_edit_admin({
        email: userData.email,
        name: userData.name,
        instance: userData.instance,
        picture: userData.picture,
      });

      if (response.success) {
        toast.success("User updated successfully!");
        setOriginalData(userData);
        setIsEditing(false);
      } else {
        if (response.error_code === 401) {
          toast.error("Session expired. Please login again.");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        } else {
          toast.error(response.message || "Failed to update user");
        }
      }
    } catch (error) {
      toast.error("Error updating user");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle cancel click
  const handleCancelClick = () => {
    if (hasUnsavedChanges) {
      setShowCancelConfirm(true);
    } else {
      setIsEditing(false);
      toast.info("Exiting edit mode");
    }
  };

  // Handle confirm cancel
  const handleConfirmCancel = () => {
    setUserData(originalData);
    setIsEditing(false);
    setShowCancelConfirm(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.files = null;
    }

    toast.info("Changes discarded, reverting to original data");
  };

  // Handle edit click
  const handleEditClick = () => {
    setIsEditing(true);
    toast.info("You can now edit user details");
  };

  const handleChangePassword = () => {
    toast.info("Change password feature is not implemented yet");
  };

  return (
    <DefaultLayout>
      {showCancelConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="text-yellow-500 text-xl" />
              <h3 id="modal-title" className="text-lg font-semibold">
                Discard Changes?
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              You have unsaved changes. Are you sure you want to discard them?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                className={buttonStyles({
                  color: "default",
                  radius: "full",
                  variant: "bordered",
                  size: "sm",
                })}
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep Editing
              </Button>
              <Button
                className={buttonStyles({
                  color: "danger",
                  radius: "full",
                  variant: "solid",
                  size: "sm",
                })}
                onClick={handleConfirmCancel}
              >
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      <section className="flex flex-col lg:flex-row gap-10 p-4 md:p-8">
        {/* Profile Image Section */}
        <div className="order-1 lg:order-2 flex flex-col gap-4 items-center w-full lg:w-auto">
          <div className="relative">
            <Image
              className="rounded-full object-cover pointer-events-none"
              alt="User Profile"
              src={userData.picture || "/logo_if.png"}
              fallbackSrc="/logo_if.png"
              width={200}
              height={200}
            />
            {/* Camera Icon */}
            <div
              className={`absolute -bottom-1 -right-[0px] z-10 bg-secondary-500 text-white rounded-full p-2 transition-colors ${
                isEditing
                  ? "cursor-pointer hover:bg-secondary-600"
                  : "cursor-not-allowed opacity-50"
              }`}
              onClick={handleCameraClick}
              role="button"
              tabIndex={isEditing ? 0 : -1}
              onKeyDown={(e) => {
                if (isEditing && (e.key === "Enter" || e.key === " ")) {
                  handleCameraClick();
                }
              }}
            >
              <FaCamera className="w-5 h-5" />
            </div>
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>

          {/* Remove Button - Tampilkan hanya jika ada gambar dan sedang editing */}
          {userData.picture && isEditing && (
            <Button
              className={buttonStyles({
                color: "danger",
                radius: "full",
                variant: "solid",
                size: "sm",
              })}
              onClick={handleRemoveImage}
            >
              Remove Image
            </Button>
          )}

          <div className="w-full">
            <Input
              color="secondary"
              label="Bergabung Pada"
              type="text"
              variant="flat"
              readOnly
              value={
                userData.joinDate
                  ? new Date(userData.joinDate).toLocaleDateString("id-ID")
                  : "-"
              }
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="order-2 lg:order-1 flex flex-wrap gap-4 w-full lg:w-[700px]">
          <div className="flex items-center gap-2 w-full">
            <p className="text-blue-600 font-semibold text-sm">
              {isEditing
                ? `Editing ${userData.name} Account`
                : `Viewing ${userData.name} Account`}
            </p>
            {hasUnsavedChanges && isEditing && (
              <span className="text-orange-500 text-xs font-medium">
                • Unsaved changes
              </span>
            )}
          </div>

          <Input
            color="secondary"
            label={`Name ${hasUnsavedChanges && userData.name !== originalData.name ? "*" : ""}`}
            type="text"
            variant="flat"
            className="w-full"
            value={userData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            {...(!isEditing && { readOnly: true })}
            isRequired
          />

          <Input
            color="secondary"
            label="Email"
            type="email"
            variant="flat"
            className="w-full"
            value={userData.email}
            readOnly
            description="Email cannot be changed"
          />

          <Input
            color="secondary"
            label={`Instance ${hasUnsavedChanges && userData.instance !== originalData.instance ? "*" : ""}`}
            type="text"
            variant="flat"
            className="w-full"
            value={userData.instance}
            onChange={(e) => handleInputChange("instance", e.target.value)}
            {...(!isEditing && { readOnly: true })}
            isRequired
          />

          <div className="flex justify-center lg:justify-start gap-2 pt-4 w-full">
            {isEditing ? (
              <Button
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "solid",
                  size: "sm",
                })}
                onClick={handleCancelClick}
                disabled={isSaving}
              >
                Cancel
              </Button>
            ) : (
              <Button
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "solid",
                  size: "sm",
                })}
                onClick={handleEditClick}
              >
                Edit
              </Button>
            )}

            <Button
              className={buttonStyles({
                color: "secondary",
                radius: "full",
                variant: isEditing ? "solid" : "bordered",
                size: "sm",
              })}
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!isEditing || isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>

            <Button
              className={buttonStyles({
                color: "secondary",
                radius: "full",
                variant: "bordered",
                size: "sm",
              })}
              disabled={!isEditing}
              onClick={handleChangePassword}
            >
              Change Password
            </Button>
          </div>
        </div>
        <ToastContainer />
      </section>
    </DefaultLayout>
  );
}
