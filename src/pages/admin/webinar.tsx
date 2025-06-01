import DefaultLayout from "@/layouts/default_admin";
import { Search } from "@/components/search";
import { CreateWebinar } from "@/components/add_webinar";
import { useState, useEffect } from "react";
import { Card, CardHeader, Image } from "@heroui/react";
import { EditIcon, TrashIcon } from "@/components/icons";
import { auth } from "@/api/auth";
import { Webinar } from "@/api/interface";
import { toast, ToastContainer } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function WebinarPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [webinarList, setWebinarList] = useState<Webinar[]>([]);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    async function loadWebinarData() {
      try {
        const result = await auth.get_all_webinar();

        if (result.success) {
          const WebinarData = result.data.map((item: any) => {
            const webinar = Webinar.fromApiResponse(item);
            // Set initial loading state for each webinar image
            setImageLoading((prev) => ({
              ...prev,
              [webinar.id || item.ID]: true,
            }));
            return webinar;
          });
          setWebinarList(WebinarData);
        }
      } catch (error) {
        toast.error("Failed to load webinar data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadWebinarData();
  }, []);

  // Function untuk handling image load
  const handleImageLoad = (webinarId: string | number) => {
    setImageLoading((prev) => ({ ...prev, [webinarId]: false }));
  };

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

  // Function untuk render skeleton cards saat loading
  const renderSkeletonCards = () => {
    return Array(8)
      .fill(0)
      .map((_, index) => (
        <Card
          key={`skeleton-${index}`}
          className="h-full flex flex-col relative pb-14"
        >
          <Skeleton
            height={168}
            className="rounded-t"
            style={{ borderRadius: "0.5rem 0.5rem 0 0" }}
          />
          <CardHeader className="p-3 flex flex-col">
            <Skeleton height={24} width="80%" className="mb-1" />
            <Skeleton height={16} width="60%" className="mb-1" />
            <Skeleton height={14} width="50%" className="mb-2" />
            <Skeleton height={32} count={2} className="mb-1" />
          </CardHeader>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex space-x-2">
              <Skeleton height={36} width="48%" />
              <Skeleton height={36} width="48%" />
            </div>
          </div>
        </Card>
      ));
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
            {renderSkeletonCards()}
          </div>
        ) : webinarList && webinarList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
            {webinarList.map((webinar, index) => (
              <Card
                key={webinar.id || index}
                className="h-full flex flex-col relative pb-14"
              >
                <div className="relative">
                  {imageLoading[webinar.id || index] && (
                    <Skeleton
                      height={168}
                      className="rounded-t absolute top-0 left-0 w-full"
                      style={{ borderRadius: "0.5rem 0.5rem 0 0" }}
                    />
                  )}
                  <Image
                    alt="Webinar image"
                    className={`object-cover w-full h-42 rounded-t ${
                      imageLoading[webinar.id || index]
                        ? "opacity-0"
                        : "opacity-100"
                    }`}
                    src={webinar.imageUrl}
                    onLoad={() => handleImageLoad(webinar.id || index)}
                    onError={() => handleImageLoad(webinar.id || index)}
                  />
                </div>
                <CardHeader className="p-3 flex flex-col">
                  <h4
                    className="font-bold text-lg truncate"
                    title={webinar.name}
                  >
                    {webinar.name || "Judul tidak tersedia"}
                  </h4>
                  <p className="text-xs uppercase font-bold text-gray-700 truncate">
                    {webinar.speaker || "Pembicara tidak tersedia"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(webinar.dstart)}
                  </p>
                  {webinar.description && (
                    <p
                      className="text-xs text-gray-600 mt-2 line-clamp-2"
                      title={webinar.description}
                    >
                      {webinar.description}
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
