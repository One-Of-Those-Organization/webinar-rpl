import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@heroui/input";
import { button as buttonStyles } from "@heroui/theme";
import { auth } from "@/api/auth";
import { EyeSlashFilledIcon, EyeFilledIcon, Logo } from "@/components/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Declare data and conditional here
export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [name, setName] = useState("");
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

    // Data that sended
    const response = await auth.register({
      name,
      email,
      instance,
      pass,
    });

    // After get response, then turn off the loading...
    setLoading(false);

    // Validator All Label must be filled
    if (!name || !email || !instance || !pass || !confirmPass) {
      setError("All field must be filled.");
      toast.error("All field must be filled.");
      return;
    }

    // Validator for Email
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid Email.");
      toast.error("Invalid Email.");
      return;
    }

    // Validator for Password
    if (!passwordRegex.test(pass)) {
      setError(
        "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and a symbol."
      );
      toast.error("The password must be strong.");
      return;
    }

    // Validator for Password that must same
    if (pass !== confirmPass) {
      setError("Password and confirmation password do not match.");
      toast.error("Password and confirmation password do not match.");
      return;
    }

    // If Register was success, then send to Login
    if (response.success) {
      setError(""); // Clear the error message
      toast.success("Registration successful!");
      navigate("/login");
    } else {
      setError(response.message || "Registration failed.");
      toast.error(response.message || "Registration failed.");
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
                    {isPasswordVisible ? (
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
