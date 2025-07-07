import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@heroui/input";
import { button as buttonStyles } from "@heroui/theme";
import { auth } from "@/api/auth";
import { auth_user } from "@/api/auth_user";
import { auth_otp } from "@/api/auth_otp";
import { EyeFilledIcon, EyeSlashFilledIcon, Logo } from "@/components/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const navigate = useNavigate();

  // Page state: 'login' | 'forgot' | 'otp' | 'reset'
  const [page, setPage] = useState("login");

  // Login page states
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState("");

  // OTP page state
  const [otp, setOtp] = useState("");

  // Reset password page states
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] =
    useState(false);

  function isStrongPassword(password: string): boolean {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) && // Ada huruf besar
      /[a-z]/.test(password) && // Ada huruf kecil
      /[0-9]/.test(password) && // Ada angka
      /[^A-Za-z0-9]/.test(password) // Ada simbol
    );
  }

  // General error/loading
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Toggles
  const togglePasswordVisibility = () => setIsPasswordVisible((v) => !v);
  const toggleNewPasswordVisibility = () => setIsNewPasswordVisible((v) => !v);
  const toggleConfirmNewPasswordVisibility = () =>
    setIsConfirmNewPasswordVisible((v) => !v);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await auth.login({ email, pass });

      if (response.success === true) {
        setError("");
        navigate("/dashboard");
        return;
      }

      switch (response.error_code) {
        case 2:
          setError("All field must be filled.");
          toast.warn("All field must be filled");
          break;
        case 3:
          setError("Invalid Email. Please make sure your email is correct.");
          toast.warn("Invalid Email.");
          break;
        case 4:
          setError("Email is not registered. Please register first.");
          toast.warn("Email is not registered");
          break;
        case 5:
          setError("Password is Incorrect. Use Forgot Password if needed.");
          toast.warn("Password is Incorrect");
          break;
        default:
          setError("Login Failed.");
          toast.error("Login Failed");
          break;
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgot = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await auth_otp.send_otp(forgotEmail);
      if (response.success) {
        toast.success("OTP has been sent to your email.");
        setPage("otp");
      } else {
        toast.error(response.message || "Failed to send OTP.", {
          toastId: "otpError",
        });
      }
    } catch (err) {
      toast.error("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOTP = (e: any) => {
    e.preventDefault();
    if (!otp) {
      setError("OTP code is required.");
      toast.warn("OTP code is required.");
      return;
    }

    setPage("reset");
    toast.info("OTP verified. Please enter your new password.");
  };

  // Handle reset password
  const handleResetPassword = async (e: any) => {
    e.preventDefault();

    if (!isStrongPassword(newPass)) {
      setError(
        "Password must be at least 8 characters, include uppercase, lowercase, and a number.",
      );
      toast.warn(
        "Password must be at least 8 characters, include uppercase, lowercase, and a number.",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await auth_user.user_reset_password({
        email: forgotEmail,
        pass: newPass,
        otp_code: otp,
      });
      if (response.success) {
        toast.success("Password has been reset successfully.");
        setPage("login");
      } else {
        toast.error(response.message || "Failed to reset password.");
      }
    } catch (err) {
      toast.error("Failed to reset password.");
    } finally {
      setLoading(false);
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
          {/* LOGIN PAGE */}
          {page === "login" && (
            <>
              <h1 className="text-3xl font-poppins md:text-4xl font-bold mb-6 md:mb-8">
                LOGIN
              </h1>
              <form onSubmit={handleLogin}>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="mb-4 md:mb-6">
                  <Input
                    color="secondary"
                    label="Email"
                    type="email"
                    variant="flat"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-4 md:mb-6 relative">
                  <Input
                    color="secondary"
                    label="Password"
                    type={isPasswordVisible ? "text" : "password"}
                    variant="flat"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    endContent={
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
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
                </div>
                <div className="mb-6 text-right">
                  <span
                    className="text-sm font-poppins font-bold text-blue-500 hover:text-blue-700 cursor-pointer"
                    onClick={() => {
                      setError("");
                      setPage("forgot");
                    }}
                  >
                    Forgot Password ?
                  </span>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={buttonStyles({
                      color: "secondary",
                      radius: "full",
                      variant: "solid",
                      size: "lg",
                    })}
                  >
                    {loading ? "Loading..." : "Login"}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* FORGOT PAGE */}
          {page === "forgot" && (
            <>
              <h1 className="text-3xl font-poppins md:text-4xl font-bold mb-6 md:mb-8">
                Recovery Account
              </h1>
              <form onSubmit={handleForgot}>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="mb-4 md:mb-6">
                  <Input
                    color="secondary"
                    label="Email"
                    type="email"
                    variant="flat"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col items-center gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={buttonStyles({
                      color: "secondary",
                      radius: "full",
                      variant: "solid",
                      size: "lg",
                    })}
                  >
                    {loading ? "Loading..." : "Send OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setPage("login");
                    }}
                    className="text-blue-500 hover:underline"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </>
          )}

          {/* OTP INPUT PAGE */}
          {page === "otp" && (
            <>
              <h1 className="text-3xl font-poppins md:text-4xl font-bold mb-6 md:mb-8">
                Enter OTP
              </h1>
              <form onSubmit={handleOTP}>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="mb-4 md:mb-6">
                  <Input
                    color="secondary"
                    label="OTP Code"
                    type="text"
                    variant="flat"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <div className="flex flex-col items-center gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={buttonStyles({
                      color: "secondary",
                      radius: "full",
                      variant: "solid",
                      size: "lg",
                    })}
                  >
                    {loading ? "Loading..." : "Verify OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setPage("forgot");
                    }}
                    className="text-blue-500 hover:underline"
                  >
                    Back
                  </button>
                </div>
              </form>
            </>
          )}

          {/* RESET PASSWORD PAGE */}
          {page === "reset" && (
            <>
              <h1 className="text-3xl font-poppins md:text-4xl font-bold mb-6 md:mb-8">
                Reset Password
              </h1>
              <form onSubmit={handleResetPassword}>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="mb-4 md:mb-6 flex flex-col gap-4">
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
                        onClick={toggleNewPasswordVisibility}
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
                <div className="flex flex-col items-center gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={buttonStyles({
                      color: "secondary",
                      radius: "full",
                      variant: "solid",
                      size: "lg",
                    })}
                  >
                    {loading ? "Loading..." : "Change Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setPage("login");
                    }}
                    className="text-blue-500 hover:underline"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
      <ToastContainer />
    </section>
  );
}
