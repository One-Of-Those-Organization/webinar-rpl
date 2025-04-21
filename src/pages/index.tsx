import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import { siteConfig } from "@/config/site";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center min-h-[65vh] text-center">
        <div className="flex flex-col items-center mb-8">
          <span className={title({ size: "lg" })}>Dapatkan Informasi</span>
          <span className={title({ color: "violet", size: "lg" })}>WEBINAR</span>
        </div>

        <div className="flex gap-4">
          <Link
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "solid",
              size: "lg",
            })}
            href="/login"
          >
            Get Started
          </Link>
        </div>
      </section>
    </DefaultLayout>
  );
}