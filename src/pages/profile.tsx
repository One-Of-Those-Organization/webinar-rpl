import { button as buttonStyles } from "@heroui/theme";
import DefaultLayout from "@/layouts/default";
import { Image, Button } from "@heroui/react";
import { Input } from "@heroui/input";
import { FaCamera, FaExclamationTriangle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { UserData } from "@/api/interface";
import { auth_user } from "@/api/auth_user";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProfilPage() {
  const user_data = localStorage.getItem("user_data");
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Current data state
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    instance: "",
    profile: "",
    createdAt: "",
  });

  // Checkpoint for original data
  const [originalData, setOriginalData] = useState({
    name: "",
    email: "",
    instance: "",
    profile: "",
    createdAt: "",
  });

  // ✅ Check for unsaved changes - termasuk gambar
  useEffect(() => {
    const hasChanges =
      userData.name !== originalData.name ||
      userData.instance !== originalData.instance ||
      userData.profile !== originalData.profile; // ✅ Deteksi perubahan gambar
    setHasUnsavedChanges(hasChanges);
  }, [userData, originalData]);

  // Handle keyboard shortcuts for saving and canceling
  useEffect(() => {
    const handleKeyPress = (e: any) => {
      if (e.key === "Escape" && isEditing) {
        handleCancelClick();
      }
      if (e.ctrlKey && e.key === "s" && isEditing) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isEditing, hasUnsavedChanges]);

  // Load initial data
  useEffect(() => {
    try {
      if (user_data) {
        const user_data_object: UserData = JSON.parse(user_data);

        const initData = {
          name: user_data_object.UserFullName,
          email: user_data_object.UserEmail,
          instance: user_data_object.UserInstance,
          profile: user_data_object.UserPicture,
          createdAt: user_data_object.UserCreatedAt,
        };

        setUserData(initData);
        setOriginalData(initData);
      }
    } catch (error) {
      toast.error("Unexpected Error!");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  const handleSave = async () => {
    if (!isEditing) return;

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
      const response = await auth_user.user_edit({
        name: userData.name,
        instance: userData.instance,
        picture: userData.profile,
      });

      if (response.success) {
        toast.success("Profile updated successfully!");

        const updatedData = {
          UserFullName: userData.name,
          UserEmail: userData.email,
          UserInstance: userData.instance,
          UserPicture: userData.profile,
          UserCreatedAt: userData.createdAt,
        };
        localStorage.setItem("user_data", JSON.stringify(updatedData));

        setOriginalData(userData);
        setIsEditing(false);
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
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

  // Handle cancel button click
  const handleCancelClick = () => {
    if (hasUnsavedChanges) {
      setShowCancelConfirm(true);
    } else {
      setIsEditing(false);
      toast.info("Exiting edit mode");
    }
  };

  // Confirm cancel action
  const handleConfirmCancel = () => {
    setUserData(originalData);
    setIsEditing(false);
    setShowCancelConfirm(false);
    toast.info("Changes discarded, reverting to original data");
  };

  // Handle edit button click
  const handleEditClick = () => {
    setIsEditing(true);
    toast.info("You can now edit your profile");
  };

  // ✅ Handle image change - hanya bisa dijalankan saat editing
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // ✅ Blokir jika tidak dalam mode edit
    if (!isEditing) {
      toast.warning(
        "Please enter edit mode first to change your profile picture"
      );
      e.target.value = "";
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeInBytes = 3 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error("Image size must be less than 3MB");
      e.target.value = "";
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, and WebP images are allowed");
      e.target.value = "";
      return;
    }

    toast.info("Processing image...");
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Image = reader.result as string;

      try {
        // ✅ Upload image to server
        const response = await auth_user.user_image({ data: base64Image });

        if (response.success) {
          let serverPath = response.data?.filename || "";
          const staticUrl = serverPath;

          // ✅ Update userData state untuk trigger unsaved changes detection
          setUserData((prev) => ({ ...prev, profile: staticUrl }));

          toast.success("Image uploaded! Remember to save your changes.");
        } else {
          toast.error("Failed to upload image");
        }
      } catch (error) {
        toast.error("Error uploading image");
      }
    };

    reader.readAsDataURL(file);
  };

  // ✅ Handle image removal - hanya bisa dijalankan saat editing
  const handleRemoveImage = async () => {
    if (!isEditing) {
      toast.warning(
        "Please enter edit mode first to remove your profile picture"
      );
      return;
    }

    // ✅ Set ke default image dan trigger unsaved changes
    setUserData((prev) => ({ ...prev, profile: "/logo_if.png" }));
    toast.success("Profile picture will be removed when you save changes");
  };

  const handleChangePassword = () => {
    toast.info("Change password feature is not implemented yet");
  };

  // If initial loading, show a spinner
  if (initialLoading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="text-yellow-500 text-xl" />
              <h3 className="text-lg font-semibold">Discard Changes?</h3>
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
              alt="Your Profile"
              src={userData.profile || "/logo_if.png"}
              fallbackSrc="/logo_if.png"
              width={200}
              height={200}
            />
            {/* ✅ Camera icon hanya aktif saat editing */}
            <label
              className={`absolute -bottom-1 -right-[0px] z-10 rounded-full p-2 ${
                isEditing
                  ? "bg-secondary-500 text-white cursor-pointer hover:bg-secondary-600 transition-colors"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              title={
                isEditing
                  ? "Change profile picture"
                  : "Enter edit mode to change picture"
              }
            >
              <FaCamera className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={!isEditing} // ✅ Disable input saat tidak editing
              />
            </label>
          </div>

          <Button
            className={buttonStyles({
              color: "secondary",
              radius: "full",
              variant: isEditing ? "solid" : "bordered",
              size: "sm",
            })}
            onClick={handleRemoveImage}
            disabled={!isEditing} // ✅ Disable saat tidak editing
          >
            Remove
          </Button>

          <div className="w-full">
            <Input
              color="secondary"
              label="Member Since"
              type="text"
              variant="flat"
              readOnly
              value={
                userData.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-"
              }
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="order-2 lg:order-1 flex flex-wrap gap-4 w-full lg:w-[700px]">
          <div className="flex items-center gap-2 w-full">
            <p className="text-blue-600 font-semibold text-sm">
              {isEditing ? `Editing Your Profile` : `Your Profile`}
            </p>
            {hasUnsavedChanges && isEditing && (
              <span className="text-orange-500 text-xs font-medium">
                • Unsaved changes
              </span>
            )}
          </div>

          <Input
            color="secondary"
            label={`Full Name ${hasUnsavedChanges && userData.name !== originalData.name ? "*" : ""}`}
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
            label="Email Address"
            type="email"
            variant="flat"
            className="w-full"
            value={userData.email}
            readOnly
            description="Email cannot be changed"
          />

          <Input
            color="secondary"
            label={`Instance/Organization ${hasUnsavedChanges && userData.instance !== originalData.instance ? "*" : ""}`}
            type="text"
            variant="flat"
            className="w-full"
            value={userData.instance}
            onChange={(e) => handleInputChange("instance", e.target.value)}
            {...(!isEditing && { readOnly: true })}
            isRequired
          />

          {/* ✅ Indicator untuk perubahan gambar */}
          {hasUnsavedChanges &&
            userData.profile !== originalData.profile &&
            isEditing && (
              <div className="w-full">
                <p className="text-orange-500 text-xs font-medium">
                  • Profile picture changed - remember to save your changes
                </p>
              </div>
            )}

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
                Edit Profile
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
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>

            <Button
              className={buttonStyles({
                color: "secondary",
                radius: "full",
                variant: "bordered",
                size: "sm",
              })}
              disabled
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
