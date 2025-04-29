import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/defaultmain";
import { Search } from "@/components/search";
import { CardView } from "@/components/card";

export default function DashboardPage() {
  return (
    <DefaultLayout>
      <section>
        <Search />
        chip

    <section>
        <div className="flex items-center justify-between mt-4">
            <h1>Live</h1>
            <small>Learn more</small>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
            <CardView/>
            <CardView/>
            <CardView/>
            <CardView/>
            <CardView/>
        </div>
    </section>

    <section>
        <div className="flex items-center justify-between mt-4">
            <h1>Upcoming</h1>
            <small>Learn more</small>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
            <CardView/>
            <CardView/>
            <CardView/>
            <CardView/>
            <CardView/>
        </div>
    </section>

      </section>
    </DefaultLayout>
  );
}
