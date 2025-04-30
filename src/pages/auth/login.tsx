import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import Cookies from "js-cookie";
import { auth } from "@/api/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await auth.login({ email, pass });

    console.log(response);
    if (response.success) {
      Cookies.set("session_id", response.userId.toString() || "dummy_token", {
        expires: 1,
      }); // expires in 1 day
      navigate("/dashboard");
    } else {
      setError(response.message);
    }
  };

  return (
    <section className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/2 bg-purple-300 flex flex-col items-center justify-center py-12 md:py-0">
        <div className="flex flex-col items-center gap-4">
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
            Register
          </Link>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center py-12 md:py-0 px-4">
        <div className="w-full max-w-xl">
          <h1 className="text-3xl font-poppins md:text-4xl font-bold mb-6 md:mb-8">
            LOGIN
          </h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4 md:mb-6">
              <Input
                color="secondary"
                label="Email"
                type="text"
                variant="flat"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4 md:mb-6 relative">
              <Input
                color="secondary"
                label="Password"
                type="password"
                variant="flat"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="mb-6 text-right">
              <a
                className="text-sm font-poppins font-bold text-blue-500 hover:text-blue-700"
                href="#"
              >
                Lupa Password ?
              </a>
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
                Masuk
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
