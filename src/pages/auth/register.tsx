import { Input } from "@heroui/input";
import { button as buttonStyles } from "@heroui/theme";
import { Link } from "@heroui/link";
import Inputpassword from "@/components/password";
// import { section } from "framer-motion/client";
// import { SVGProps } from "react";
// import { JSX } from "react/jsx-runtime";
// import React from "react";


export default function RegisterPage() {

  return (
    <section className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/2 flex items-center justify-center py-12 md:py-0 px-4 order-2 md:order-1">
        <div className="w-full max-w-xl">
          <h1 className="text-3xl font-poppins md:text-4xl font-bold mb-6 md:mb-8">FORM DATA</h1>
          <form>
            <div className="mb-4 md:mb-6">
            <Input
                    color="secondary"
                    label="Nama"
                    type="text"
                    variant="flat"
                  />
            </div>
            <div className="mb-4 md:mb-6">
                  <Input
                    color="secondary"
                    label="NIM"
                    type="number"
                    variant="flat"
                  />
            </div>
            <div className="mb-4 md:mb-6">
                  <Input
                    color="secondary"
                    label="Email"
                    type="email"
                    variant="flat"
                  />
            </div>
            <div className="mb-4 md:mb-6">
                  <Input
                    color="secondary"
                    label="Instansi"
                    type="text"
                    variant="flat"
                  />
            </div>
            <div className="mb-4 md:mb-6 relative">
            <Inputpassword/>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Link
                className={buttonStyles({
                  color: "secondary",
                  radius: "full",
                  variant: "solid",
                  size: "lg",
                })}
                href="/login"
              >
                Daftar
              </Link>
            </div>
          </form>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 bg-purple-300 flex flex-col items-center justify-center py-12 md:py-0 order-1 md:order-2">
        <div className="flex flex-col items-center gap-8">
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
            href="/login"
          >
            Back To Login
          </Link>
        </div>
      </div>
    </section>
  );
}