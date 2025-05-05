import DefaultLayout from "@/layouts/default_admin";
import Table from "@/components/table";

export default function ManageUserPage() {
  return (
    <DefaultLayout>
      <section>
        <Table/>
      </section>
    </DefaultLayout>
  );
}
