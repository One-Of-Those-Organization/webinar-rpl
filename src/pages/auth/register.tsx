import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@heroui/input";
import { button as buttonStyles } from "@heroui/theme";
import { Link } from "@heroui/link";
import { auth } from "@/api/auth";
import { EyeSlashFilledIcon, EyeFilledIcon } from "@/components/icons";

export default function RegisterPage() {
  // NOTE : Add Validator for email and password
  // if you want to add other labels, you can add it in the api/auth.ts
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [instance, setInstance] = useState("");
  const [, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await auth.register({
      email,
      pass,
      name,
      instance,
    });

    // redirect to login if register success
    if (response.success) {
      navigate("/login");
    } else {
      setError(response.message);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <section className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/2 flex items-center justify-center py-12 md:py-0 px-4 order-2 md:order-1">
        <div className="w-full max-w-xl">
          <h1 className="text-3xl font-poppins md:text-4xl font-bold mb-6 md:mb-8">
            FORM DATA
          </h1>
          <form onSubmit={handleRegister}>
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
            <div className="mb-4 md:mb-6">
              <Input
                color="secondary"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
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

            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "solid",
                  size: "lg",
                })}
              >
                Daftar
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-purple-300 flex flex-col items-center justify-center py-12 md:py-0 order-1 md:order-2">
        <div className="flex flex-col items-center gap-8">
          <img
            src="../../../public/logo_if.png"
            alt="Colorful logo with IF letters"
            className="h-48 md:h-64 w-48 md:w-64"
          />
          <Link
            className={buttonStyles({
              color: "secondary",
              radius: "full",
              variant: "bordered",
              size: "lg",
            })}
            href="/register"
          >
            Back To Login
          </Link>
        </div>
      </div>
    </section>
  );
}
