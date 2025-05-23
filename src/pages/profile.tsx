import { button as buttonStyles } from "@heroui/theme";
import DefaultLayout from "@/layouts/default";
import { Image, Button } from "@heroui/react";
import { Input } from "@heroui/input";
import { FaCamera } from "react-icons/fa";
import { useEffect, useState } from "react";
import { UserData } from "@/api/interface";
import { auth } from "@/api/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProfilPage() {
  const user_data = localStorage.getItem("user_data");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [instance, setInstance] = useState("");
  const [profile, setProfile] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [isEdited, setIsEdited] = useState(false);
  const [error, setError] = useState("");
  const [isTogglingEdit, setIsTogglingEdit] = useState(false);

  const [originalData, setOriginalData] = useState({
    name: "",
    email: "",
    instance: "",
    profile: "",
    createdAt: "",
  });

  // Use useEffect so it doesnt aggresively refresh
  useEffect(() => {
    try {
      if (user_data) {
        const user_data_object: UserData = JSON.parse(user_data);

        // Better Format Date
        const rawDate = user_data_object.UserCreatedAt.split("T")[0]; // Ambil "2025-05-07"
        const [year, month, day] = rawDate.split("-"); // Split jadi ["2025", "05", "07"]
        const formattedDate = `${day}-${month}-${year}`; // Susun jadi "07-05-2025"
        setCreatedAt(formattedDate);

        const initData = {
          name: user_data_object.UserFullName,
          email: user_data_object.UserEmail,
          instance: user_data_object.UserInstance,
          profile: user_data_object.UserPicture,
          createdAt: formattedDate,
        };

        setOriginalData(initData);
        setName(initData.name);
        setEmail(initData.email);
        setInstance(initData.instance);
        setProfile(initData.profile);
        setCreatedAt(initData.createdAt);
      }
    } catch (error) {
      toast.error("Unexpected Error!");
    }
  }, []);

  // Handle Save dengan benar
  const handleSave = async () => {
    try {
      if (
        name === originalData.name &&
        instance === originalData.instance &&
        profile === originalData.profile
      ) {
        toast.info("No changes to save.");
        return;
      }

      const response = await auth.user_edit({
        name,
        instance,
        picture: profile,
      });

      if (response.success) {
        toast.success("Profile updated successfully.");

        // Update localStorage
        const updatedData = {
          UserFullName: name,
          UserEmail: email,
          UserInstance: instance,
          UserPicture: profile,
          UserCreatedAt: originalData.createdAt,
        };
        localStorage.setItem("user_data", JSON.stringify(updatedData));

        setIsEdited(false);
        setError("");
      } else {
        toast.error(response.message || "Failed to update profile");
        setError(response.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      setError("Network error. Please try again.");
    }
  };

  // Handle Image Change
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.info("Uploading image...");

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        try {
          setProfile(base64Image);

          const response = await auth.user_image({ data: base64Image });

          if (response.success) {
            let imageUrl = "";

            if (response.data?.filename) {
              imageUrl = `/${response.data.filename}`;
              console.log("Setting correct image URL:", imageUrl);
            }

            const userData = JSON.parse(
              localStorage.getItem("user_data") || "{}"
            );
            userData.UserPicture = imageUrl;
            localStorage.setItem("user_data", JSON.stringify(userData));

            setProfile(imageUrl);

            setTimeout(() => {
              const timestampedUrl = `${imageUrl}?t=${new Date().getTime()}`;
              setProfile(timestampedUrl);
            }, 100);

            toast.success("Image updated successfully!");
          } else {
            toast.error("Failed to update image");
          }
        } catch (error) {
          console.error("Upload error:", error);
          toast.error("Error uploading image");
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = async () => {
    try {
      const response = await auth.user_edit({
        name,
        instance,
        picture: "/logo_if.png",
      });

      if (response.success) {
        setProfile("/logo_if.png");
        toast.success("Profile picture removed");

        if (user_data) {
          const userData = JSON.parse(user_data);
          userData.UserPicture = "/logo_if.png";
          localStorage.setItem("user_data", JSON.stringify(userData));
        }
      } else {
        toast.error("Failed to remove image");
      }
    } catch (error) {
      toast.error("Error removing image");
    }
  };

  // Handle Edit Mode
  const handleToggleEdit = (toState: boolean) => {
    if (isTogglingEdit) {
      toast.info("Please wait...");
      return;
    }

    setIsTogglingEdit(true);
    setIsEdited(toState);

    setTimeout(() => {
      setIsTogglingEdit(false);
    }, 5);
  };

  // View if not in mode edit
  if (isEdited == false) {
    return (
      <DefaultLayout>
        <section className="flex flex-col lg:flex-row gap-10 p-4 md:p-8">
          {/* Profile Image Section - Will appear first on mobile */}
          <div className="order-1 lg:order-2 flex flex-col gap-4 items-center w-full lg:w-auto">
            <div className="relative">
              <Image
                className="rounded-full object-cover pointer-events-none"
                alt="Profil User"
                src={profile}
                fallbackSrc="/logo_if.png"
                width={200}
                height={200}
              />
              <label className="absolute -bottom-1 -right-[0px] z-10 bg-secondary-500 text-white rounded-full p-2 cursor-pointer">
                <FaCamera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <Button
              className={buttonStyles({
                color: "secondary",
                radius: "full",
                variant: "solid",
                size: "sm",
              })}
              onClick={handleRemoveImage}
            >
              Remove
            </Button>
            <div className="w-full">
              <Input
                color="secondary"
                label="Created At"
                type="text"
                variant="flat"
                readOnly
                value={createdAt}
              />
            </div>
          </div>

          {/* Form Section - Will appear second on mobile */}
          <div className="order-2 lg:order-1 flex flex-wrap gap-4 w-full lg:w-[700px]">
            <p className="text-blue-600 font-semibold text-sm invisible">
              On Editing Mode
            </p>
            <Input
              color="secondary"
              label="Name"
              type="text"
              variant="flat"
              readOnly
              className="w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              color="secondary"
              label="Email"
              type="email"
              variant="flat"
              readOnly
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              color="secondary"
              label="Instance"
              type="text"
              variant="flat"
              readOnly
              className="w-full"
              value={instance}
              onChange={(e) => setInstance(e.target.value)}
            />
            <div className="flex justify-center lg:justify-start gap-2 pt-4 w-full">
              <button
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "solid",
                  size: "sm",
                })}
                onClick={() => handleToggleEdit(true)}
              >
                Edit
              </button>
              <button
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "bordered",
                  size: "sm",
                })}
                disabled
              >
                Save
              </button>
              <button
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "bordered",
                  size: "sm",
                })}
                disabled
              >
                Change Password
              </button>
            </div>
          </div>
          {/* Toast Container */}
          <ToastContainer />
        </section>
      </DefaultLayout>
    );
  }
  // View editing mode
  else {
    return (
      <DefaultLayout>
        <section className="flex flex-col lg:flex-row gap-10 p-4 md:p-8">
          {/* Profile Image Section - Will appear first on mobile */}
          <div className="order-1 lg:order-2 flex flex-col gap-4 items-center w-full lg:w-auto">
            <div className="relative">
              <Image
                className="rounded-full object-cover pointer-events-none"
                alt="Profil User"
                src={profile}
                fallbackSrc="/logo_if.png"
                width={200}
                height={200}
              />
              <label className="absolute -bottom-1 -right-[0px] z-10 bg-secondary-500 text-white rounded-full p-2 cursor-pointer">
                <FaCamera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <Button
              className={buttonStyles({
                color: "secondary",
                radius: "full",
                variant: "solid",
                size: "sm",
              })}
              onClick={() => {
                handleRemoveImage();
                setProfile(originalData.profile);
              }}
            >
              Remove
            </Button>
            <div className="w-full">
              <Input
                color="secondary"
                label="Created At"
                type="text"
                variant="flat"
                value={createdAt}
              />
            </div>
          </div>
          <div className="order-2 lg:order-1 flex flex-wrap gap-4 w-full lg:w-[700px]">
            <p className="text-blue-600 font-semibold text-sm">
              On Editing Mode
            </p>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <Input
              color="secondary"
              label="Name"
              type="text"
              variant="flat"
              className="w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              color="secondary"
              label="Email"
              type="email"
              variant="flat"
              readOnly
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              color="secondary"
              label="Instance"
              type="text"
              variant="flat"
              className="w-full"
              value={instance}
              onChange={(e) => setInstance(e.target.value)}
            />
            <div className="flex justify-center lg:justify-start gap-2 pt-4 w-full">
              <button
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "solid",
                  size: "sm",
                })}
                onClick={() => {
                  setName(originalData.name);
                  setEmail(originalData.email);
                  setInstance(originalData.instance);
                  setCreatedAt(originalData.createdAt);
                  handleToggleEdit(false);
                }}
              >
                Cancel
              </button>
              <button
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "solid",
                  size: "sm",
                })}
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "solid",
                  size: "sm",
                })}
              >
                Change Password
              </button>
            </div>
          </div>
          {/* Toast Container */}
          <ToastContainer />
        </section>
      </DefaultLayout>
    );
  }
}
