import DefaultLayout from "@/layouts/default_admin";
import { Search } from "@/components/search";
import { CardViewAdmin } from "@/components/card_a";
import { CreateWebinar } from "@/components/add_webinar";

export default function WebinarPage() {
  return (
    <DefaultLayout>
      <section>
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex justify-between items-center gap-4 mb-4">
            <Search />
            <CreateWebinar/>
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
