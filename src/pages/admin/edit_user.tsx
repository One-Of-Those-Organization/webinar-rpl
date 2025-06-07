import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import DefaultLayout from "@/layouts/default_admin";
import { Image, Button } from "@heroui/react";
import { Input } from "@heroui/input";
import { FaCamera } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth_user } from "@/api/auth_user";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EditUserPage() {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    instance: "",
    picture: "",
    joinDate: "",
  });

  // Load user data saat component mount
  useEffect(() => {
    if (!email) {
      toast.error("No user email provided");
      navigate("/admin/user");
      return;
    }

    const loadUserData = async () => {
      try {
        setInitialLoading(true);
        // Decode email karena di URL ter-encode
        const decodedEmail = decodeURIComponent(email);
        const response = await auth_user.get_user_by_email(decodedEmail);

        if (response.success && response.data) {
          setUserData({
            name: response.data.UserFullName || "",
            email: response.data.UserEmail || "",
            instance: response.data.UserInstance || "",
            picture: response.data.UserPicture || "",
            joinDate: response.data.UserCreatedAt || "",
          });
        } else {
          toast.error("Failed to load user data");
          navigate("/admin/user");
        }
      } catch (error) {
        toast.error("Error loading user data");
        navigate("/admin/user");
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserData();
  }, [email, navigate]);

  const handleSave = async () => {
    if (!userData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    if (!userData.instance.trim()) {
      toast.error("Instance cannot be empty");
      return;
    }

    try {
      setLoading(true);

      const response = await auth_user.user_edit_admin({
        email: userData.email,
        name: userData.name,
        instance: userData.instance,
        picture: userData.picture,
      });

      if (response.success) {
        toast.success("User updated successfully!");
        setTimeout(() => {
          navigate("/admin/user");
        }, 2000);
      } else {
        toast.error(response.message || "Failed to update user");
      }
    } catch (error) {
      toast.error("Error updating user");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Loading state saat pertama load
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
      <section className="flex flex-col lg:flex-row gap-10 p-4 md:p-8">
        {/* Profile Image Section */}
        <div className="order-1 lg:order-2 flex flex-col gap-4 items-center w-full lg:w-auto">
          <div className="relative">
            <Image
              className="rounded-full object-cover pointer-events-none"
              alt="User Profile"
              src={
                userData.picture ||
                "https://heroui.com/images/hero-card-complete.jpeg"
              }
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

          <div className="w-full">
            <Input
              color="secondary"
              label="Bergabung Pada"
              type="text"
              variant="flat"
              value={
                userData.joinDate
                  ? new Date(userData.joinDate).toLocaleDateString("id-ID")
                  : ""
              }
              readOnly
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="order-2 lg:order-1 flex flex-wrap gap-4 w-full lg:w-[700px]">
          <Input
            color="secondary"
            label="Name"
            type="text"
            variant="flat"
            value={userData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            isRequired
          />

          <Input
            color="secondary"
            label="Email"
            type="text"
            variant="flat"
            value={userData.email}
            readOnly
          />

          <Input
            color="secondary"
            label="Instance"
            type="text"
            variant="flat"
            value={userData.instance}
            onChange={(e) => handleInputChange("instance", e.target.value)}
            isRequired
          />

          <div className="flex flex-row gap-2 pt-4 w-full">
            <Link
              className={buttonStyles({
                color: "secondary",
                radius: "full",
                variant: "solid",
                size: "sm",
              })}
              href="/admin/user"
            >
              Cancel
            </Link>

            <Button
              className={buttonStyles({
                color: "secondary",
                radius: "full",
                variant: "solid",
                size: "sm",
              })}
              onClick={handleSave}
              isLoading={loading}
              disabled={loading || initialLoading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </section>

      <ToastContainer />
    </DefaultLayout>
  );
}
