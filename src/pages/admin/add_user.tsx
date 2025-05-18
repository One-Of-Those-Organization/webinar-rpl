import { button as buttonStyles } from "@heroui/theme";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import DefaultLayout from "@/layouts/default";
import { Image } from "@heroui/react";
import { Input } from "@heroui/input";
import { FaCamera } from "react-icons/fa";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddUserPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [instance, setInstance] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState("");
  const [userRole, setUserRole] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result as string;
        setProfile(result);
        toast.success("Image selected!");
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!name || !email || !instance || !password || !userRole) {
      toast.warn("Please fill all required fields");
      return;
    }

    if (name.length < 0) {
      toast.info("Please enter the name");
      return;
    }

    if (instance.length < 0) {
      toast.info("Please enter the instance");
      return;
    }

    if (password.length < 0) {
      toast.info("Please enter the password");
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // TODO: Implement API call here later

      // Simulate success for now
      setTimeout(() => {
        toast.success("User added successfully!");
        // Reset form fields
        setName("");
        setEmail("");
        setInstance("");
        setPassword("");
        setProfile("");
        setUserRole(0);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col lg:flex-row gap-10 p-4 md:p-8">
        {/* Profile Image Section - Will appear first on mobile */}
        <div className="order-1 lg:order-2 flex flex-col gap-4 items-center w-full lg:w-auto">
          <div className="relative">
            <Image
              className="rounded-full object-cover pointer-events-none"
              alt="User Profile"
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
              setProfile("");
              toast.success("Image removed");
            }}
          >
            Remove
          </Button>
        </div>

        {/* Form Section - Will appear second on mobile */}
        <div className="order-2 lg:order-1 flex flex-wrap gap-4 w-full lg:w-[700px]">
          {error && <p className="text-red-500 text-sm mb-4 w-full">{error}</p>}

          <Input
            color="secondary"
            label="Name"
            type="text"
            variant="flat"
            className="w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            color="secondary"
            label="Email"
            type="email"
            variant="flat"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            color="secondary"
            label="Instance"
            type="text"
            variant="flat"
            className="w-full"
            value={instance}
            onChange={(e) => setInstance(e.target.value)}
            required
          />

          <Input
            color="secondary"
            label="Password"
            type="password"
            variant="flat"
            className="w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="w-full">
            <label className="text-sm text-secondary-600">User Role</label>
            <Dropdown>
              <DropdownTrigger>
                <Button className="text-sm w-full p-2 mt-1 rounded-md bg-secondary-50 border border-secondary-200 text-purple-700">
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
            <button
              className={buttonStyles({
                color: "secondary",
                radius: "full",
                variant: "solid",
                size: "sm",
              })}
              onClick={() => (window.location.href = "/admin/user")}
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
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add User"}
            </button>
          </div>
        </div>

        {/* Toast Container */}
        <ToastContainer />
      </section>
    </DefaultLayout>
  );
}
