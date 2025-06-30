import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { button as buttonStyles } from "@heroui/theme";
import { EyeFilledIcon, EyeSlashFilledIcon, Logo } from "@/components/icons";
import { useState } from "react";
import { Input } from "@heroui/input";
import { toast, ToastContainer } from "react-toastify";
import { auth_user } from "@/api/auth_user";

export default function ChangePassword() {
  // Get the user Email from URL parameters
  const { email } = useParams<{ email: string }>();
  const parsedEmail = email ? decodeURIComponent(email) : "";

  // Navigate Hook
  const navigate = useNavigate();

  // Error State
  const [error, setError] = useState<string>("");

  // Loading State
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Password State
  const [oldPass, setOldPass] = useState<string>("");
  const [newPass, setNewPass] = useState<string>("");
  const [confirmNewPass, setConfirmNewPass] = useState<string>("");

  // Check if the new password is strong
  function isStrongPassword(password: string): boolean {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  }

  // Toggle Invisible / Visible Password
  const [isOldPasswordVisible, setIsOldPasswordVisible] =
    useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] =
    useState<boolean>(false);
  const toggleOldPasswordVisibility = () => setIsOldPasswordVisible((v) => !v);
  const toggleNewPasswordVisibility = () => setIsPasswordVisible((v) => !v);
  const toggleConfirmNewPasswordVisibility = () =>
    setIsConfirmNewPasswordVisible((v) => !v);

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!parsedEmail) {
        setError("Invalid email address.");
        toast.error("Invalid email address.", {
          toastId: "change-password-error",
        });
        return;
      } else if (!oldPass || !newPass || !confirmNewPass) {
        setError("All fields are required.");
        toast.warning("All fields are required.", {
          toastId: "change-password-warning",
        });
        return;
      } else if (!isStrongPassword(newPass)) {
        setError(
          "New password must be at least 8 characters long, contain uppercase letters, lowercase letters, numbers, and symbols."
        );
        toast.warning(
          "New password must be at least 8 characters long, contain uppercase letters, lowercase letters, numbers, and symbols.",
          { toastId: "change-password-warning" }
        );
        return;
      } else if (newPass !== confirmNewPass) {
        setError("New password and confirm password do not match.");
        toast.warning("New password and confirm password do not match.", {
          toastId: "change-password-warning",
        });
        return;
      } else {
        setError("");
      }

      setIsLoading(true);

      // Call the API to change the password
      const response = await auth_user.user_edit({ password: newPass });
      if (response.success) {
        toast.success("Password changed successfully!", {
          toastId: "change-password-success",
        });
        navigate("/profile");
      } else {
        setError("Failed to change password. Please try again.");
        toast.error("Failed to change password. Please try again.", {
          toastId: "change-password-error",
        });
      }
      toast.info("Changing password...", { toastId: "change-password" });
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
      toast.error("An unexpected error occurred. Please try again later.", {
        toastId: "change-password-error",
      });
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex flex-col md:flex-row h-screen">
      {/* Left Sidebar */}
      <div className="w-full md:w-1/2 bg-purple-300 flex flex-col items-center justify-center py-12 md:py-0">
        <div className="flex flex-col items-center gap-4">
          <Logo className="h-48 md:h-64 w-48 md:w-64" />
          <p className="text-md font-poppins text-center text-purple-500">
            Doesn't have account?
          </p>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className={`${buttonStyles({
              color: "secondary",
              radius: "full",
              variant: "bordered",
              size: "lg",
            })} hover:bg-secondary-600 hover:text-white`}
          >
            Register
          </button>
        </div>
      </div>

      {/* Right Content */}
      <div className="w-full md:w-1/2 flex items-center justify-center py-12 md:py-0 px-4">
        <div className="w-full max-w-xl">
          <h1 className="text-3xl font-poppins md:text-4xl font-bold mb-6 md:mb-8">
            CHANGE PASSWORD
          </h1>
          <form onSubmit={handleChangePassword}>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="mb-4 md:mb-6 flex flex-col gap-4">
              {/* Old Password Label */}
              <Input
                color="secondary"
                label="Old Password"
                type={isOldPasswordVisible ? "text" : "password"}
                variant="flat"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                endContent={
                  <button
                    type="button"
                    onClick={toggleOldPasswordVisibility}
                    aria-label="Toggle password visibility"
                    className="focus:outline-none"
                  >
                    {isPasswordVisible ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />

              {/* New Password Label */}
              <Input
                color="secondary"
                label="New Password"
                type={isPasswordVisible ? "text" : "password"}
                variant="flat"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                endContent={
                  <button
                    type="button"
                    onClick={toggleNewPasswordVisibility}
                    aria-label="Toggle password visibility"
                    className="focus:outline-none"
                  >
                    {isPasswordVisible ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />

              {/* Confirm New Password Label */}
              <Input
                color="secondary"
                label="Confirm New Password"
                type={isConfirmNewPasswordVisible ? "text" : "password"}
                variant="flat"
                value={confirmNewPass}
                onChange={(e) => setConfirmNewPass(e.target.value)}
                endContent={
                  <button
                    type="button"
                    onClick={toggleConfirmNewPasswordVisibility}
                    aria-label="Toggle password visibility"
                    className="focus:outline-none"
                  >
                    {isConfirmNewPasswordVisible ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />
            </div>

            {/* Button Send Change Password */}
            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "solid",
                  size: "lg",
                })}
              >
                {isLoading ? "Loading..." : "Change Password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/profile");
                }}
                className="text-blue-500 hover:underline"
              >
                Back to Profile
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
}
