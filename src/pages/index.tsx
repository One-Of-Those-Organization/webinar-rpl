import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { useEffect, useState } from "react";

// Default page for the application

export default function IndexPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center min-h-[65vh] text-center">
        <div className="flex flex-col items-center mb-8">
          <span className={title({ size: "lg" })}>Dapatkan Informasi</span>
          <span className={title({ color: "violet", size: "lg" })}>
            WEBINAR
          </span>
          <span className={title({ size: "sm" })}>Learn. Connect. Grow.</span>
        </div>

        <div className="flex gap-4">
          <Link
            className={buttonStyles({
              color: "secondary",
              radius: "full",
              variant: "solid",
              size: "lg",
            })}
            href={isLoggedIn ? "/dashboard" : "/login"}
          >
            Get Started
          </Link>
        </div>
      </section>
    </DefaultLayout>
  );
}
