// import DefaultLayout from "@/layouts/default";
import Inputpassword from "@/components/password";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
// import { Link } from "@heroui/link";
// import '@/styles/globals.css';
// import '@/styles/main.css';

export default function LoginPage() {
  return (
    
    <section className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/2 bg-purple-300 flex flex-col items-center justify-center py-12 md:py-0">
              <div className="flex flex-col items-center gap-4">
                <img
                  src="https://placehold.co/600x600"
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
                <h1 className="text-3xl font-poppins md:text-4xl font-bold mb-6 md:mb-8">LOGIN</h1>
                <form>
                  <div className="mb-4 md:mb-6">
                  <Input
                    color="secondary"
                    label="NIM"
                    type="number"
                    variant="flat"
                  />
      
                  </div>
                  <div className="mb-4 md:mb-6 relative">
                  <Inputpassword
                  />
                  </div>
                  <div className="mb-6 text-right">
                    <a className="text-sm font-poppins font-bold text-blue-500 hover:text-blue-700" href="#">
                      Lupa Password ?
                    </a>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                  <Link
                      className={buttonStyles({
                        color: "secondary",
                        radius: "full",
                        variant: "solid",
                        size: "lg",

                      })}
                      href="/dashboard"
                    >
                      Masuk
                    </Link>
                  </div>
                </form>
              </div>
            </div>
    </section>
  );
}
