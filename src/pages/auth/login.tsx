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

    // Avoid spam click
    setLoading(true);

    // Data that sended
    const response = await auth.login({ email, pass });

    if (!emailRegex.test(email)) {
      setError("Please input your Email.");
      toast.error("Please input your Email.");
      // Example of stop loading after error
      setLoading(false);
      return;
    }

    // Validator All Label must be filled
    if (response.error_code == 2) {
      setError("All field must be filled.");
      toast.error("All field must be filled");
      setLoading(false);
      return;
    }

    // Validator if the email not registered
    if (response.error_code == 3) {
      setError("Email or Password is invalid.");
      toast.error("Email or Password is invalid.");
      setLoading(false);
      return;
    }

    // Handle error dari backend
    if (response.error_code == 4) {
      setError("Password is Incorrect");
      toast.error("Password is Incorrect");
      setLoading(false);
      return;
    }

    // If Login was success, then send to Dashboard
    if (response.success && response.error_code == 0) {
      setLoading(false);
      setError("");
      localStorage.setItem("token", response.token);
      navigate("/dashboard");
    } else {
      setError("Login failed");
      toast.error("Login failed");
    }
  };

  return (
    <section className="flex flex-col md:flex-row h-screen">
      {/* Left Sidebar */}
      <div className="w-full md:w-1/2 bg-purple-300 flex flex-col items-center justify-center py-12 md:py-0">
        <div className="flex flex-col items-center gap-4">
          <Logo className="h-48 md:h-64 w-48 md:w-64" />
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
                href="#"
              >
                Lupa Password ?
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
