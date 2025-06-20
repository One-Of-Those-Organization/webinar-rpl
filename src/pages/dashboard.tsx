import DefaultLayout from "@/layouts/default";
import { CardView } from "@/components/card";
import { useState, useEffect, useMemo } from "react";
import { auth_webinar } from "@/api/auth_webinar";
import { Webinar } from "@/api/interface";
import { toast, ToastContainer } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Dashboard Page for user
export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [webinarList, setWebinarList] = useState<Webinar[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWebinarData() {
      try {
        setError(null);
        const result = await auth_webinar.get_all_webinar();

        if (result.success) {
          const WebinarData = result.data.map((item: any) =>
            Webinar.fromApiResponse(item)
          );
          setWebinarList(WebinarData);
        } else {
          const errorMessage = result.message || "Gagal memuat data webinar";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (error) {
        const errorMessage =
          "Failed to load webinar data. Please try again later.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadWebinarData();
  }, []);

  // Separate webinars into categories with timezone awareness
  const { liveWebinars, upcomingWebinars } = useMemo(() => {
    const now = new Date();

    const live = webinarList.filter((webinar) => {
      if (!webinar.dstart || !webinar.dend) return false;
      // Ensure proper timezone handling
      const startDate = new Date(webinar.dstart);
      const endDate = new Date(webinar.dend);
      return now >= startDate && now <= endDate;
    });

    const upcoming = webinarList.filter((webinar) => {
      if (!webinar.dstart) return false;
      const startDate = new Date(webinar.dstart);
      return now < startDate;
    });

    return {
      liveWebinars: live,
      upcomingWebinars: upcoming,
    };
  }, [webinarList]);

  // Dynamic skeleton count based on screen size
  const getSkeletonCount = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1536
        ? 5
        : window.innerWidth >= 1280
          ? 4
          : window.innerWidth >= 1024
            ? 3
            : 2;
    }
    return 3;
  };

  const renderSkeletonCards = (count: number = getSkeletonCount()) => {
    return Array(count)
      .fill(0)
      .map((_, index) => (
        <div key={`skeleton-${index}`} className="w-full">
          <Skeleton
            height={200}
            className="rounded-xl"
            style={{ borderRadius: "0.75rem" }}
          />
        </div>
      ));
  };

  const renderWebinarSection = (title: string, webinars: Webinar[]) => (
    <section className="mb-8">
      <div className="flex items-center justify-between mt-4 mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <small className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
          Learn more
        </small>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {webinars.map((webinar) => (
          <CardView key={webinar.id} webinar={webinar} />
        ))}
      </div>

      {webinars.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          {`No ${title.toLowerCase()} webinars available.`}
        </div>
      )}
    </section>
  );

  // Error state
  if (error && !isLoading) {
    return (
      <DefaultLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <ToastContainer />
      </DefaultLayout>
    );
  }

  // Loading state - tampilkan skeleton untuk semua section
  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="space-y-8">
          {/* Live Webinars Skeleton */}
          <section className="mb-8">
            <div className="flex items-center justify-between mt-4 mb-4">
              <Skeleton height={32} width={100} />
              <Skeleton height={16} width={80} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {renderSkeletonCards()}
            </div>
          </section>

          {/* Upcoming Webinars Skeleton */}
          <section className="mb-8">
            <div className="flex items-center justify-between mt-4 mb-4">
              <Skeleton height={32} width={140} />
              <Skeleton height={16} width={80} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {renderSkeletonCards()}
            </div>
          </section>
        </div>
        <ToastContainer />
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      {/* Live Webinars Section */}
      {renderWebinarSection("Live", liveWebinars)}

      {/* Upcoming Webinars Section */}
      {renderWebinarSection("Upcoming", upcomingWebinars)}

      <ToastContainer />
    </DefaultLayout>
  );
}
