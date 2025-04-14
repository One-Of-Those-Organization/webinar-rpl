import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

// Main Page

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title()}>Welcome to&nbsp;</span>
          <br />
          <span className={title({ color: "violet" })}>Webinar UKDC&nbsp;</span>
          <br />
          <div className={subtitle({ class: "mt-4" })}>
            The best learning happens when the experience feels natural.
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
