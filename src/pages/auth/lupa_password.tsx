import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@heroui/input";
import { button as buttonStyles } from "@heroui/theme";
// import { auth, LupaPasswordResponse } from "@/api/auth";
import { EyeSlashFilledIcon, EyeFilledIcon, Logo } from "@/components/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Declare data and conditional here
export default function LupaPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [error, setError] = useState("");
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmNewPasswordVisible, setIsNewConfirmPasswordVisible] =
    useState(false);
  const togglePasswordVisibility = () => {
    setIsNewPasswordVisible(!isNewPasswordVisible);
  };
  const toggleConfirmPasswordVisibility = () => {
    setIsNewConfirmPasswordVisible(!isConfirmNewPasswordVisible);
  };
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~.]).{8,}$/;

  const handleLupaPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Avoid spam click
    setLoading(true);

    // Data Send to Backend
    // let response: LupaPasswordResponse = {
    //   message: "",
    //   success: false,
    //   error_code: -1,
    // };

    // Validator All Label must be filled
    if (newPass.length <= 0 && confirmNewPass.length <= 0) {
      setError("Please fill in all fields.");
      toast.error("All fields are required.");
      setLoading(false);
      return;
    }

    // Validator if newPass is empty
    if (newPass.length <= 0) {
      setError("Please input your Confirm Password.");
      toast.error("Please input your Confirm Password.");
      setLoading(false);
      return;
    }

    // Validator if newConfirmPass is empty
    if (confirmNewPass.length <= 0) {
      setError("Please input your Confirm Password.");
      toast.error("Please input your Confirm Password.");
      setLoading(false);
      return;
    }

    // Validator for Password that must same
    if (newPass !== confirmNewPass) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Validator for Password
    if (!passwordRegex.test(newPass)) {
      setError(
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
      );
      toast.error("Please enter a stronger password.");
      setLoading(false);
      return;
    }

    // Data Send to Backend
    // response = await auth.lupa_password({
    //   pass: newPass,
    // });

    // If Lupa Password was success, then send to Login
    // if (response.success && response.error_code == 0) {
    //   setLoading(false);
    //   setError("");
    //   toast.success("Password Successfully changed!");
    //   navigate("/login");
    // } else {
    //   setError("Password failed to changed.");
    //   toast.error("Password failed to changed.");
    // }
  };

  return (
    <section className="flex flex-col md:flex-row h-screen">
      {/* Left Sidebar (previously Right) */}
      <div className="w-full md:w-1/2 bg-purple-300 flex flex-col items-center justify-center py-12 md:py-0 order-1">
        <div className="flex flex-col items-center gap-8">
          <Logo className="h-48 md:h-64 w-48 md:w-64" />
          {/* Button Switch to Login */}
          <button
            type="submit"
            onClick={() => navigate("/login")}
            className={`${buttonStyles({
              color: "secondary",
              radius: "full",
              variant: "bordered",
              size: "lg",
            })} hover:bg-secondary-600 hover:text-white`}
          >
            Back to Login
          </button>
        </div>
      </div>

      {/* Right Sidebar (previously Left) */}
      <div className="w-full md:w-1/2 flex items-center justify-center py-12 md:py-0 px-4 order-2">
        <div className="w-full max-w-xl">
          <h1 className="text-3xl font-poppins md:text-4xl font-bold mb-6 md:mb-8">
            FORGOT PASSWORD
          </h1>
          <form onSubmit={handleLupaPassword}>
            {/* Show Error */}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            {/* Label Password */}
            <div className="mb-4 md:mb-6">
              <Input
                color="secondary"
                label="Set New Password"
                type={isNewPasswordVisible ? "text" : "password"}
                variant="flat"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                endContent={
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    aria-label="Toggle password visibility"
                    className="focus:outline-none"
                  >
                    {isNewPasswordVisible ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />
            </div>

            {/* Label Confirm Password */}
            <div className="mb-4 md:mb-6">
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
                    onClick={toggleConfirmPasswordVisibility}
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

            {/* Submit Button */}
            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                onClick={() => navigate("/login")}
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "solid",
                  size: "lg",
                })}
              >
                {loading ? "Loading..." : "Masuk"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Toast Container */}
      <ToastContainer />
    </section>
  );
}
