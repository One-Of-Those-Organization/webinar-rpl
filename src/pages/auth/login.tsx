import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@heroui/input";
import { button as buttonStyles } from "@heroui/theme";
import { auth } from "@/api/auth";
import { EyeFilledIcon, EyeSlashFilledIcon, Logo } from "@/components/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validator for must input all fields
      if (email.length <= 0 && pass.length <= 0) {
        setError("Please fill in all fields.");
        toast.warn("All fields are required.");
        return;
      }

      // Validator for must input email
      if (email.length <= 0) {
        setError("Please input your Email.");
        toast.info("Please input your Email.");
        return;
      }

      // Validator for must input password
      if (pass.length <= 0) {
        setError("Please input your Password.");
        toast.info("Please input your Password.");
        return;
      }

      // Validator for email format
      if (!emailRegex.test(email)) {
        setError("Please input valid Email.");
        toast.info("Please input valid Email.");
        return;
      }

      // API call
      const response = await auth.login({ email, pass });

      // Server-side validations
      if (response.error_code === 2) {
        setError("All field must be filled.");
        toast.warn("All field must be filled");
        return;
      }

      if (response.error_code === 3) {
        setError("Email or Password is invalid.");
        toast.warn("Email or Password is invalid.");
        return;
      }

      if (response.error_code === 4) {
        setError("Password is Incorrect");
        toast.warn("Password is Incorrect");
        return;
      }

      // Success case
      if (response.success) {
        setError("");
        toast.success("Login Successful!");
        navigate("/dashboard");
      } else {
        setError("Login Failed");
        toast.error("Login Failed");
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
      <div className="w-full md:w-1/2 bg-purple-300 flex flex-col items-center justify-center py-12 md:py-0">
        <div className="flex flex-col items-center gap-4">
          <Logo className="h-48 md:h-64 w-48 md:w-64" />
          <p className="text-md font-poppins text-center text-purple-500">
            Doesn't have account?
          </p>
          <button
            type="submit"
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

      <div className="w-full md:w-1/2 flex items-center justify-center py-12 md:py-0 px-4">
        <div className="w-full max-w-xl">
          <h1 className="text-3xl font-poppins md:text-4xl font-bold mb-6 md:mb-8">
            LOGIN
          </h1>
          <form onSubmit={handleLogin}>
            {/* Show Error */}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="mb-4 md:mb-6">
              {/* Label Email */}
              <Input
                color="secondary"
                label="Email"
                type="email"
                variant="flat"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {/* Label Password */}
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
              {/* Redirect Lupa Password (WIP) */}
              <a
                className="text-sm font-poppins font-bold text-blue-500 hover:text-blue-700"
                href="/otp_lupa_password"
              >
                Forgot Password ?
              </a>
            </div>
            <div className="flex flex-col items-center gap-4">
              {/* Button Login to Dashboard */}
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
        </div>
      </div>
      {/* Toast Container */}
      <ToastContainer />
    </section>
  );
}
