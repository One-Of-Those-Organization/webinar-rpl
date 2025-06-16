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
  const [registeredWebinars, setRegisteredWebinars] = useState<number[]>([]);

  useEffect(() => {
    async function loadWebinarData() {
      try {
        const result = await auth_webinar.get_all_webinar();

        if (result.success) {
          const WebinarData = result.data.map((item: any) => 
            Webinar.fromApiResponse(item)
          );
          setWebinarList(WebinarData);
        } else {
          toast.error(result.message || "Gagal memuat data webinar");
        }
      } catch (error) {
        toast.error("Failed to load webinar data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadWebinarData();
    
    // Load registered webinars from localStorage (you might want to fetch from API)
    const registered = localStorage.getItem("registered_webinars");
    if (registered) {
      setRegisteredWebinars(JSON.parse(registered));
    }
  }, []);

  // Separate webinars into categories
  const { registeredWebinarsList, liveWebinars, upcomingWebinars } = useMemo(() => {
    const now = new Date();
    
    const registered = webinarList.filter(webinar => 
      registeredWebinars.includes(webinar.id)
    );
    
    const nonRegistered = webinarList.filter(webinar => 
      !registeredWebinars.includes(webinar.id)
    );

    const live = nonRegistered.filter(webinar => {
      if (!webinar.dstart || !webinar.dend) return false;
      const startDate = new Date(webinar.dstart);
      const endDate = new Date(webinar.dend);
      return now >= startDate && now <= endDate;
    });

    const upcoming = nonRegistered.filter(webinar => {
      if (!webinar.dstart) return false;
      const startDate = new Date(webinar.dstart);
      return now < startDate;
    });

    return {
      registeredWebinarsList: registered,
      liveWebinars: live,
      upcomingWebinars: upcoming
    };
  }, [webinarList, registeredWebinars]);

  const handleRegister = (webinarId: number) => {
    const newRegistered = [...registeredWebinars, webinarId];
    setRegisteredWebinars(newRegistered);
    localStorage.setItem("registered_webinars", JSON.stringify(newRegistered));
    toast.success("Successfully registered for webinar!");
  };

  const renderSkeletonCards = (count: number) => {
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

  const renderWebinarSection = (
    title: string, 
    webinars: Webinar[], 
    showRegistered: boolean = false
  ) => (
    <section className="mb-8">
      <div className="flex items-center justify-between mt-4 mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <small className="text-gray-500 cursor-pointer hover:text-gray-700">
          Learn more
        </small>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {renderSkeletonCards(5)}
        </div>
      ) : webinars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {webinars.map((webinar) => (
            <CardView
              key={webinar.id}
              webinar={webinar}
              isRegistered={showRegistered}
              onRegister={handleRegister}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {title === "My Registered Webinars" 
            ? "You haven't registered for any webinars yet."
            : `No ${title.toLowerCase()} available.`
          }
        </div>
      )}
    </section>
  );

  return (
    <DefaultLayout>
      {/* Registered Webinars Section */}
      {registeredWebinarsList.length > 0 && 
        renderWebinarSection("My Registered Webinars", registeredWebinarsList, true)
      }

      {/* Live Webinars Section */}
      {renderWebinarSection("Live", liveWebinars)}

      {/* Upcoming Webinars Section */}
      {renderWebinarSection("Upcoming", upcomingWebinars)}

      <ToastContainer />
    </DefaultLayout>
  );
}