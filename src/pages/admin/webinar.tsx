import DefaultLayout from "@/layouts/default_admin";
import { Search } from "@/components/search";
import { CreateWebinar } from "@/components/add_webinar";
import { useState, useEffect } from "react";
import { Card, CardHeader, Image } from "@heroui/react";
import { EditIcon, TrashIcon } from "@/components/icons";
import { auth } from "@/api/auth";
import { WebinarInput } from "@/api/interface";
import { toast, ToastContainer } from "react-toastify";

export default function WebinarPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [webinarList, setWebinarList] = useState<WebinarInput[]>([]);

  useEffect(() => {
    async function loadWebinarData() {
      try {
        const result = await auth.get_all_webinar();

        if (result.success) {
          setWebinarList(result.data);
        }
      } catch (error) {
        toast.error("Failed to load webinar data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadWebinarData();
  }, []);

  // Function untuk formatting tanggal
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "Date not available";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <DefaultLayout>
      <section>
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex justify-between items-center gap-4 mb-4">
            <Search />
            <CreateWebinar />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-gray-500">
            Loading Webinar...
          </div>
        ) : webinarList && webinarList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
            {webinarList.map((webinar, index) => (
              <Card
                key={webinar.ID || index}
                className="h-full flex flex-col relative pb-14"
              >
                <Image
                  alt="Webinar image"
                  className="object-cover w-full h-42 rounded-t"
                  src={
                    webinar.EventImg ||
                    "https://heroui.com/images/hero-card-complete.jpeg"
                  }
                />
                <CardHeader className="p-3 flex flex-col">
                  <h4
                    className="font-bold text-lg truncate"
                    title={webinar.EventName}
                  >
                    {webinar.EventName || "Judul tidak tersedia"}
                  </h4>
                  <p className="text-xs uppercase font-bold text-gray-700 truncate">
                    {webinar.EventSpeaker || "Pembicara tidak tersedia"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(webinar.EventDStart)}
                  </p>
                  {webinar.EventDesc && (
                    <p
                      className="text-xs text-gray-600 mt-2 line-clamp-2"
                      title={webinar.EventDesc}
                    >
                      {webinar.EventDesc}
                    </p>
                  )}
                </CardHeader>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex space-x-2">
                    <button
                      className="flex-1 flex justify-center items-center bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
                      onClick={() => console.log("Edit webinar", webinar)}
                    >
                      <EditIcon size={14} className="mr-1" />
                      <span>Edit</span>
                    </button>
                    <button
                      className="flex-1 flex justify-center items-center bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                      onClick={() => console.log("Delete webinar", webinar)}
                    >
                      <TrashIcon size={14} className="mr-1" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Tidak ada webinar yang tersedia.
          </div>
        )}
      </section>
      <ToastContainer />
    </DefaultLayout>
  );
}
