import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@heroui/input";
import { button as buttonStyles } from "@heroui/theme";
// import { auth , OTPLupaPasswordResponse} from "@/api/auth";
import { Logo } from "@/components/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Declare data and conditional here
export default function OTPLupaPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleLupaPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Avoid spam click
    setLoading(true);

    // Data Send to Backend
    // let response: OTPLupaPasswordResponse = {
    //   message: "",
    //   success: false,
    //   error_code: -1,
    // };

    // Validator for Password that must same
    if (email === "") {
      setError("Please fill the OTP Code.");
      toast.error("Please fill the OTP Code.");
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

    // Data Send to Backend
    // response = await auth.otp_lupa_password({
    //   pass: newPass,
    // });

    // If Register was success, then send to Login
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
                label="Email"
                type="email"
                variant="flat"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                onClick={() => navigate("/lupa_password")}
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "solid",
                  size: "lg",
                })}
              >
                {loading ? "Loading..." : "Send Code"}
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
