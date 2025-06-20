import { button as buttonStyles } from "@heroui/theme";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import DefaultLayout from "@/layouts/default_admin";
import { Image } from "@heroui/react";
import { Input } from "@heroui/input";
import { FaCamera } from "react-icons/fa";
import { useState, useRef, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth_user } from "@/api/auth_user";
import { auth } from "@/api/auth";
import { RegisterAdmin } from "@/api/interface";

export default function AddUserPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [instance, setInstance] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState("");
  const [userRole, setUserRole] = useState(0);
  const [loading, setLoading] = useState(false);

  // Regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~.]).{8,}$/;

  // Ref untuk input file
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setProfile(result);
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
    setProfile("");

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
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Handle client-side validation errors
      let clientOnlyError = null;

      switch (true) {
        case name.length <= 0:
          clientOnlyError = {
            message: "Please enter the name",
            type: "info",
          };
          break;

        case email.length <= 0:
          clientOnlyError = {
            message: "Please enter the email",
            type: "info",
          };
          break;

        case !emailRegex.test(email):
          clientOnlyError = {
            message: "Please enter a valid email address",
            type: "warn",
          };
          break;

        case instance.length <= 0:
          clientOnlyError = {
            message: "Please enter the instance",
            type: "info",
          };
          break;

        case password.length <= 0:
          clientOnlyError = {
            message: "Please enter the password",
            type: "info",
          };
          break;

        case !passwordRegex.test(password):
          clientOnlyError = {
            message:
              "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
            type: "warn",
          };
          break;
      }

      if (clientOnlyError) {
        if (clientOnlyError.type === "warn") {
          toast.warn(clientOnlyError.message);
        } else {
          toast.info(clientOnlyError.message);
        }
        setLoading(false);
        return;
      }

      // Prepare data untuk API call
      const registerData: RegisterAdmin = {
        name: name,
        email: email,
        instance: instance,
        pass: password,
        picture: profile || undefined,
      };

      // Call API register admin
      let result;
      if (userRole === 1) {
        // Register admin
        result = await auth_user.register_admin(registerData);
      } else {
        // Register regular user
        result = await auth.register({
          ...registerData,
        });
      }

      // Handle server-side validation errors
      if (result.success) {
        toast.success(
          result.message ||
            `${userRole === 1 ? "Admin" : "Regular"} user added successfully!`
        );

        // Reset form fields
        setName("");
        setEmail("");
        setInstance("");
        setPassword("");
        setProfile("");
        setUserRole(0);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
          fileInputRef.current.files = null;
        }

        // Optional: redirect after success
        setTimeout(() => {
          window.location.href = "/admin/user";
        }, 2000);
        return;
      }

      // Handle server-side validation errors
      switch (result.error_code) {
        case 2:
          toast.warn("All field must be filled");
          break;

        case 3:
          toast.warn("Invalid Email.");
          break;

        case 5:
          toast.warn("User with that email already registered.");
          break;

        case 401:
          toast.error("Session expired. Please login again.");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
          break;

        default:
          toast.error(result.message || "Failed to add user");
          break;
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col lg:flex-row gap-10 p-4 md:p-8">
        {/* Profile Image Section */}
        <div className="order-1 lg:order-2 flex flex-col gap-4 items-center w-full lg:w-auto">
          <div className="relative">
            <Image
              className="rounded-full object-cover pointer-events-none"
              alt="User Profile"
              src={profile || "/logo_if.png"}
              fallbackSrc="/logo_if.png"
              width={200}
              height={200}
            />
            {/* Camera Icon */}
            <div
              className="absolute -bottom-1 -right-[0px] z-10 bg-secondary-500 text-white rounded-full p-2 cursor-pointer hover:bg-secondary-600 transition-colors"
              onClick={handleCameraClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
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

          {/* Remove Button - Tampilkan hanya jika ada gambar */}
          {profile && (
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
        </div>

        {/* Form Section */}
        <div className="order-2 lg:order-1 flex flex-wrap gap-4 w-full lg:w-[700px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="w-full flex flex-wrap gap-4"
          >
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

            <Input
              color="secondary"
              label="Password"
              type="password"
              variant="flat"
              className="w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="w-full">
              <label className="text-sm text-secondary-600 mb-1 block">
                User Role
              </label>
              <Dropdown>
                <DropdownTrigger>
                  <Button className="text-sm w-full p-2 mt-1 rounded-md bg-secondary-50 border border-secondary-200 text-purple-700 justify-start">
                    {userRole === 1 ? "Admin" : "Regular User"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="User Role Options"
                  className="bg-secondary-50"
                >
                  <DropdownItem
                    key="0"
                    className="text-purple-700"
                    onClick={() => setUserRole(0)}
                  >
                    Regular User
                  </DropdownItem>
                  <DropdownItem
                    key="1"
                    className="text-purple-700"
                    onClick={() => setUserRole(1)}
                  >
                    Admin
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>

            <div className="flex justify-center lg:justify-start gap-2 pt-4 w-full">
              <Button
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "bordered",
                  size: "sm",
                })}
                onClick={() => (window.location.href = "/admin/user")}
                disabled={loading}
                type="button"
              >
                Cancel
              </Button>

              <Button
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "solid",
                  size: "sm",
                })}
                onClick={handleSubmit}
                disabled={loading}
                isLoading={loading}
                type="submit"
              >
                {loading
                  ? "Adding..."
                  : `Add ${userRole === 1 ? "Admin" : "Regular"} User`}
              </Button>
            </div>
          </form>
        </div>

        {/* Toast Container */}
        <ToastContainer />
      </section>
    </DefaultLayout>
  );
}
