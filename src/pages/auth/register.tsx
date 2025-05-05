import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@heroui/input";
import { button as buttonStyles } from "@heroui/theme";
import { auth } from "@/api/auth";
import { EyeSlashFilledIcon, EyeFilledIcon, Logo } from "@/components/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RegisterResponse } from "@/api/auth";

// Declare data and conditional here
export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [email, setEmail] = useState("");
  const [instance, setInstance] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~.]).{8,}$/;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Avoid spam click
    setLoading(true);

    let response: RegisterResponse = {
      message: "",
      success: false,
      error_code: 0,
    };

    // Validator All Label must be filled or instance is empty
    if (
      (email.length <= 0 && name.length <= 0 && pass.length <= 0) ||
      instance.length <= 0
    ) {
      setError("Please fill in all fields.");
      toast.error("All fields are required.");
      setLoading(false);
      return;
    }

    // Validator for Email
    if (!emailRegex.test(email)) {
      setError("Invalid email format.");
      toast.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    // Validator if pass is empty
    if (pass.length <= 0) {
      setError("Please input your Password.");
      toast.error("Please input your Password.");
      setLoading(false);
      return;
    }

    // Validator if confirmPass is empty
    if (confirmPass.length <= 0) {
      setError("Please input your Confirm Password.");
      toast.error("Please input your Confirm Password.");
      setLoading(false);
      return;
    }

    // Validator for Password that must same
    if (pass !== confirmPass) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Validator for Password
    if (!passwordRegex.test(pass)) {
      setError(
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
      );
      toast.error("Please enter a stronger password.");
      setLoading(false);
      return;
    }

    // Validator All Label must be filled
    if (response.error_code == 2) {
      setError("All field must be filled.");
      toast.error("All field must be filled.");
      setLoading(false);
      return;
    }

    // Validator if the email not registered or already registered
    if (response.error_code == 4) {
      setError("Email is already registered.");
      toast.error("Email is already registered.");
      setLoading(false);
      return;
    }

    // Data Send to Backend
    response = await auth.register({
      name,
      email,
      instance,
      pass,
    });

    // If Register was success, then send to Login
    if (response.success && response.error_code == 0) {
      setLoading(false);
      setError("");
      toast.success("Registration successful!");
      navigate("/login");
    } else {
      setError("Registration failed.");
      toast.error("Registration failed.");
    }
  };

  return (
    <section className="flex flex-col md:flex-row h-screen">
      {/* Left Sidebar */}
      <div className="w-full md:w-1/2 flex items-center justify-center py-12 md:py-0 px-4 order-2 md:order-1">
        <div className="w-full max-w-xl">
          <h1 className="text-3xl font-poppins md:text-4xl font-bold mb-6 md:mb-8">
            FORM DATA
          </h1>
          <form onSubmit={handleRegister}>
            {/* Show Error */}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            {/* Label Name */}
            <div className="mb-4 md:mb-6">
              <Input
                color="secondary"
                label="Name"
                type="text"
                variant="flat"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Label Email */}
            <div className="mb-4 md:mb-6">
              <Input
                color="secondary"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Label Instance */}
            <div className="mb-4 md:mb-6">
              <Input
                color="secondary"
                label="Instance"
                type="text"
                variant="flat"
                value={instance}
                onChange={(e) => setInstance(e.target.value)}
              />
            </div>

            {/* Label Password */}
            <div className="mb-4 md:mb-6">
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

            {/* Label Confirm Password */}
            <div className="mb-4 md:mb-6">
              <Input
                color="secondary"
                label="Confirm Password"
                type={isConfirmPasswordVisible ? "text" : "password"}
                variant="flat"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                endContent={
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
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

            {/* Submit Button */}
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
                {loading ? "Loading..." : "Masuk"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full md:w-1/2 bg-purple-300 flex flex-col items-center justify-center py-12 md:py-0 order-1 md:order-2">
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
      {/* Toast Container */}
      <ToastContainer />
    </section>
  );
}
