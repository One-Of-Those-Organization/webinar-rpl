import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import DefaultLayout from "@/layouts/default_admin";
import { Search } from "@/components/search";
import { CardViewAdmin } from "@/components/card_a";
import { PlusIcon } from "@/components/icons";

export default function WebinarPage() {
  return (
    <DefaultLayout>
      <section>
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex justify-between items-center gap-4 mb-4">
            <Search />
            <Link href="/admin/webinar/create" className={buttonStyles()}>
              <PlusIcon size={400}
              />
              Create Webinar
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
          <CardViewAdmin/>
          <CardViewAdmin/>
          <CardViewAdmin/>
          <CardViewAdmin/>
          <CardViewAdmin/>
        </div>
      </section>
    </DefaultLayout>
  );
}
