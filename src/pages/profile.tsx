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

  // Use useEffect so it doesnt aggresively refresh
  useEffect(() => {
    try {
      // Check kalau dapet data (biar ga null)
      if (user_data) {
        // Fetch (parse) data from json
        const user_data_object: UserData = JSON.parse(user_data);

        // Set value to useState
        setName(user_data_object.UserFullName);
        setEmail(user_data_object.UserEmail);
        setInstance(user_data_object.UserInstance);

        // Profile is still WIP
        setProfile(user_data_object.UserPicture);
        // Maybe want to change password too in profile ?

        // Better Format Date
        const rawDate = user_data_object.UserCreatedAt.split("T")[0]; // Ambil "2025-05-07"
        const [year, month, day] = rawDate.split("-"); // Split jadi ["2025", "05", "07"]
        const formattedDate = `${day}-${month}-${year}`; // Susun jadi "07-05-2025"
        setCreatedAt(formattedDate);
      }
    } catch (error) {
      toast.error("Unexpected Error!");
    }
  }, []);

  const handleToggleEdit = (toState: boolean) => {
    if (isTogglingEdit) {
      toast.error("Please wait...");
      return;
    }

    setIsTogglingEdit(true);
    setIsEdited(toState);

    setTimeout(() => {
      setIsTogglingEdit(false);
    }, 5);
  };

  const handleSave = async () => {
    if (user_data) {
      const check_user_data = JSON.parse(user_data);
      if (
        name === check_user_data.UserFullName &&
        instance === check_user_data.UserInstance
      ) {
        toast.error("No changes to save.");
      } else {
        toast.success("Profile updated successfully.");
      }
    }

    const response = await auth.user_edit({ name, instance, picture: "" });

    if (response.success) {
      // Success case
      const updatedData = {
        UserFullName: name,
        UserEmail: email,
        UserInstance: instance,
        UserPicture: profile,
        UserCreatedAt: createdAt,
      };
      localStorage.setItem("user_data", JSON.stringify(updatedData));
      setIsEdited(false);
      setError("");
    } else {
      toast.error("Failed to Update!");
      setError("Failed to Update!");
    }
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
                src="https://heroui.com/images/hero-card-complete.jpeg"
                width={153}
                height={153}
              />
              <Button
                isIconOnly
                className="absolute -bottom-1 -right-[0px] z-10 bg-secondary-500 text-white rounded-full"
                aria-label="Edit Photo"
              >
                <FaCamera className="w-5 h-5" />
              </Button>
            </div>

            <Button
              className={buttonStyles({
                color: "secondary",
                radius: "full",
                variant: "solid",
                size: "sm",
              })}
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
                src="https://heroui.com/images/hero-card-complete.jpeg"
                width={153}
                height={153}
              />
              <Button
                isIconOnly
                className="absolute -bottom-1 -right-[0px] z-10 bg-secondary-500 text-white rounded-full"
                aria-label="Edit Photo"
              >
                <FaCamera className="w-5 h-5" />
              </Button>
            </div>
            <Button
              className={buttonStyles({
                color: "secondary",
                radius: "full",
                variant: "solid",
                size: "sm",
              })}
              href="/"
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
                onClick={() => handleToggleEdit(false)}
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
            </div>
          </div>
          {/* Toast Container */}
          <ToastContainer />
        </section>
      </DefaultLayout>
    );
  }
}
