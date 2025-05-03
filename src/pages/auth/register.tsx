import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@heroui/input";
import { button as buttonStyles } from "@heroui/theme";
import { auth } from "@/api/auth";
import { Logo } from "@/components/icons";
import { EyeSlashFilledIcon, EyeFilledIcon } from "@/components/icons";
import { toast, ToastContainer } from "react-toastify"; // Used to send error (Pop Out)
import "react-toastify/dist/ReactToastify.css";

// Declare data and conditional here
export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [instance, setInstance] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~.]).{8,}$/;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validator All Label must be filled
    if (!name || !email || !instance || !pass || !confirmPass) {
      setError("Semua field harus diisi.");
      toast.error("Semua field harus diisi.");
      return;
    }

    // Validator for Email
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email tidak valid.");
      toast.error("Email tidak valid.");
      return;
    }

    // Validator for Password
    if (!passwordRegex.test(pass)) {
      setError(
        "Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol."
      );
      toast.error("Password harus kuat.");
      return;
    }

    // Validator for Password that must same
    if (pass !== confirmPass) {
      setError("Password dan konfirmasi password tidak sama.");
      toast.error("Password dan konfirmasi password tidak sama.");
      return;
    }

    // Clear error before submit
    setError("");

    // Data that sended
    const response = await auth.register({
      name,
      email,
      instance,
      pass,
    });

    // If Register was success, then send to Login
    if (response.success) {
      toast.success("Registrasi berhasil!");
      navigate("/login");
    } else {
      setError(response.message || "Registrasi gagal.");
      toast.error(response.message || "Registrasi gagal.");
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

            {/* Input Fields */}
            <div className="mb-4 md:mb-6">
              <Input
                color="secondary"
                label="Nama"
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
                type={isPasswordVisible ? "text" : "password"}
                variant="flat"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
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

            {/* Submit Button */}
            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                className={`${buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "solid",
                  size: "lg",
                })} hover:bg-secondary-600 hover:text-white`}
              >
                Daftar
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
