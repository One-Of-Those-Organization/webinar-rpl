import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@heroui/input";
import { button as buttonStyles } from "@heroui/theme";
import { auth } from "@/api/auth";
import { auth_otp } from "@/api/auth_otp";
import { EyeSlashFilledIcon, EyeFilledIcon, Logo } from "@/components/icons";
import { RegisterData } from "@/api/interface";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterData>({
    name: "",
    email: "",
    instance: "",
    pass: "",
    otp_code: "",
  });
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const navigate = useNavigate();

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~.]).{8,}$/;

  const handleChange =
    (key: keyof RegisterData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));
    };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCooldown > 0) {
      timer = setTimeout(() => setOtpCooldown((t) => t - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  const canSendOtp =
    !!form.name &&
    !!form.email &&
    !!form.pass &&
    !!confirmPass &&
    passwordRegex.test(form.pass) &&
    form.pass === confirmPass &&
    otpCooldown === 0;

  const handleGenOTP = async () => {
    if (!canSendOtp) return;
    setOtpLoading(true);
    toast.info("Sending OTP to your email...");
    setError("");
    try {
      const response = await auth_otp.send_otp(form.email);
      if (response.success) {
        toast.success("OTP sent to your email.");
        setOtpCooldown(30);
      } else {
        setError(response.message);
        toast.error(response.message);
      }
    } catch (error) {
      setError("Failed to send OTP. Please try again.");
      toast.error("Failed to send OTP. Please try again.");
    }
    setOtpLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (
      !form.name ||
      !form.email ||
      !form.pass ||
      !confirmPass ||
      !form.otp_code
    ) {
      setError("All required fields must be filled.");
      toast.warn("All required fields must be filled.");
      setLoading(false);
      return;
    }

    if (form.pass !== confirmPass) {
      setError("Passwords do not match.");
      toast.warn("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!passwordRegex.test(form.pass)) {
      setError(
        "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      toast.warn(
        "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await auth.register(form);

      if (response.success) {
        setError("");
        toast.success("Register Successful!");
        navigate("/login");
        return;
      }

      switch (response.error_code) {
        case 2:
          setError("All field must be filled.");
          toast.warn("All field must be filled");
          break;
        case 3:
          setError("Invalid Email.");
          toast.warn("Invalid Email.");
          break;
        case 5:
          setError("User with that email already registered.");
          toast.warn("User with that email already registered.");
          break;
        case 6:
          setError("Invalid or expired OTP.");
          toast.warn("Invalid or expired OTP.");
          break;
        default:
          setError("Register Failed.");
          toast.error("Register Failed");
          break;
      }
    } catch (error) {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col md:flex-row h-screen">
      {/* Left Sidebar */}
      <div className="w-full md:w-1/2 flex items-center justify-center py-12 md:py-0 px-4 order-2 md:order-1">
        <div className="w-full max-w-xl">
          <h1 className="text-3xl font-poppins md:text-4xl font-bold mb-6 md:mb-8">
            REGISTER
          </h1>
          <form onSubmit={handleRegister}>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="mb-4 md:mb-6">
              <Input
                color="secondary"
                label="Name"
                type="text"
                variant="flat"
                value={form.name}
                onChange={handleChange("name")}
                autoComplete="name"
              />
            </div>
            <div className="mb-4 md:mb-6">
              <Input
                color="secondary"
                label="Email"
                variant="flat"
                value={form.email}
                onChange={handleChange("email")}
                type="email"
                autoComplete="email"
              />
            </div>
            <div className="mb-4 md:mb-6">
              <Input
                color="secondary"
                label="Instance"
                type="text"
                variant="flat"
                value={form.instance}
                onChange={handleChange("instance")}
                autoComplete="organization"
              />
            </div>
            <div className="mb-4 md:mb-6">
              <Input
                color="secondary"
                label="Password"
                type={isPasswordVisible ? "text" : "password"}
                variant="flat"
                value={form.pass}
                onChange={handleChange("pass")}
                autoComplete="new-password"
                endContent={
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible((v) => !v)}
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
            <div className="mb-4 md:mb-6">
              <Input
                color="secondary"
                label="Confirm Password"
                type={isConfirmPasswordVisible ? "text" : "password"}
                variant="flat"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                autoComplete="new-password"
                endContent={
                  <button
                    type="button"
                    onClick={() => setIsConfirmPasswordVisible((v) => !v)}
                    aria-label="Toggle password visibility"
                    className="focus:outline-none"
                  >
                    {isConfirmPasswordVisible ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />
            </div>
            <div className="mb-4 md:mb-6">
              <Input
                color="secondary"
                label="OTP"
                type="text"
                variant="flat"
                value={form.otp_code}
                onChange={handleChange("otp_code")}
                autoComplete="one-time-code"
                endContent={
                  <button
                    type="button"
                    disabled={!canSendOtp || otpLoading}
                    className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold border
                      ${
                        otpCooldown > 0 || otpLoading
                          ? "border-gray-300 text-gray-400 bg-transparent cursor-not-allowed"
                          : "border-purple-500 text-purple-500 bg-transparent hover:bg-purple-50"
                      }
                    `}
                    onClick={handleGenOTP}
                    style={{ minWidth: 100 }}
                  >
                    {otpCooldown > 0
                      ? `Send${otpLoading ? "..." : ""} (${otpCooldown}s)`
                      : otpLoading
                        ? "Sending..."
                        : "Send"}
                  </button>
                }
              />
              {!canSendOtp && (
                <p className="text-xs text-gray-500 mt-1">
                  Please complete the required data (name, valid email, valid
                  password, and matching password confirmation) before sending
                  the OTP.
                </p>
              )}
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
                {loading ? "Loading..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Right Sidebar */}
      <div className="w-full md:w-1/2 bg-purple-300 flex flex-col items-center justify-center py-12 md:py-0 order-1 md:order-2">
        <div className="flex flex-col items-center gap-4">
          <Logo className="h-48 md:h-64 w-48 md:w-64" />
          <p className="text-md font-poppins text-center text-purple-500">
            Already have account?
          </p>
          <button
            type="button"
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
      {/* Toast Container */}
      <ToastContainer />
    </section>
  );
}
