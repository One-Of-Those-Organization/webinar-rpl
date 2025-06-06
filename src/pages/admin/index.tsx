import DefaultLayout from "@/layouts/default_admin";
import { auth_user } from "@/api/auth_user";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DashboardAdminPage() {
  const [totalUser, setTotalUser] = useState(0);

  const handleCountUser = async () => {
    try {
      const response = await auth_user.get_user_count();
      if (response.success) {
        setTotalUser(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch user count");
    }
  };

  useEffect(() => {
    handleCountUser();
  }, []);

  return (
    <DefaultLayout>
      <section>
        <div className="flex flex-row gap-4 mb-4">
          <div className="bg-red-500 rounded-2xl p-4 w-full">
            <h1 className="pb-4">Total User</h1>
            <small className="flex flex-col text-left">{totalUser}</small>
          </div>
          <div className="bg-blue-500 rounded-2xl p-4 w-full">
            <h1 className="pb-4">Total Webinar</h1>
            <small className="flex flex-col text-left">0</small>
          </div>
        </div>
      </section>
      <ToastContainer />
    </DefaultLayout>
  );
}
