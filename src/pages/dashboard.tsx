import DefaultLayout from "@/layouts/default";
import { CardView } from "@/components/card";
import { useState, useEffect, useMemo } from "react";
import { auth_webinar } from "@/api/auth_webinar";
import { auth_participants } from "@/api/auth_participants";
import { Webinar } from "@/api/interface";
import { toast, ToastContainer } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useNavigate } from "react-router-dom";

// Dashboard Page for user
export default function DashboardPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [webinarList, setWebinarList] = useState<Webinar[]>([]);
  const [registeredWebinars, setRegisteredWebinars] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);

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
          
          // Load registered webinars from API after getting webinar list
          await loadRegisteredWebinars(WebinarData);
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

    // Listen for webinar registration events
    const handleWebinarRegistered = (event: CustomEvent) => {
      const { webinarId } = event.detail;
      setRegisteredWebinars(prev => {
        if (!prev.includes(webinarId)) {
          const newRegistered = [...prev, webinarId];
          localStorage.setItem("registered_webinars", JSON.stringify(newRegistered));
          return newRegistered;
        }
        return prev;
      });
    };

    window.addEventListener('webinar-registered', handleWebinarRegistered as EventListener);
    
    return () => {
      window.removeEventListener('webinar-registered', handleWebinarRegistered as EventListener);
    };
  }, []);

  // Load registered webinars from API
  const loadRegisteredWebinars = async (webinars: Webinar[]) => {
    setIsLoadingRegistrations(true);
    const registered: number[] = [];
    
    console.log("🔍 Loading registered webinars for", webinars.length, "webinars");
    
    for (const webinar of webinars) {
      try {
        const result = await auth_participants.event_participate_info(webinar.id);
        console.log(`🔍 Registration check for webinar ${webinar.id}:`, result);
        
        if (result.success && result.data) {
          registered.push(webinar.id);
          console.log(`✅ User is registered for webinar ${webinar.id}`);
        }
      } catch (error) {
        // User not registered for this webinar, skip
        console.log(`❌ User not registered for webinar ${webinar.id}`);
      }
    }
    
    console.log("🔍 Final registered webinars:", registered);
    setRegisteredWebinars(registered);
    
    // Also sync with localStorage for backup
    localStorage.setItem("registered_webinars", JSON.stringify(registered));
    setIsLoadingRegistrations(false);
  };

  // Separate webinars into categories with timezone awareness
  const { registeredWebinarsList, liveWebinars, upcomingWebinars } = useMemo(() => {
    const now = new Date();
    
    const registered = webinarList.filter(webinar => 
      registeredWebinars.includes(webinar.id)
    );
    
    const nonRegistered = webinarList.filter(webinar => 
      !registeredWebinars.includes(webinar.id)
    );

    const live = nonRegistered.filter((webinar) => {
      if (!webinar.dstart || !webinar.dend) return false;
      // Ensure proper timezone handling
      const startDate = new Date(webinar.dstart);
      const endDate = new Date(webinar.dend);
      return now >= startDate && now <= endDate;
    });

    const upcoming = nonRegistered.filter((webinar) => {
      if (!webinar.dstart) return false;
      const startDate = new Date(webinar.dstart);
      return now < startDate;
    });

    return {
      registeredWebinarsList: registered,
      liveWebinars: live,
      upcomingWebinars: upcoming,
    };
  }, [webinarList, registeredWebinars]);

  // Updated handleRegister to use API
  const handleRegister = async (webinarId: number) => {
    try {
      console.log("🔍 Attempting to register for webinar:", webinarId);
      
      const result = await auth_participants.event_participate_register({
        id: webinarId,
        role: "normal",
      });

      console.log("🔍 DEBUG REGISTRATION RESULT:", result);

      if (result.success) {
        const newRegistered = [...registeredWebinars, webinarId];
        setRegisteredWebinars(newRegistered);
        localStorage.setItem("registered_webinars", JSON.stringify(newRegistered));
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('webinar-registered', { 
          detail: { webinarId } 
        }));
        
        toast.success("Successfully registered for webinar!");
      } else {
        toast.error(result.message || "Failed to register for webinar");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again later.");
    }
  };

  // Handle navigation to section pages
  const handleLearnMore = (sectionType: string) => {
    const sectionMap = {
      "Registered": "registered",
      "Live": "live",
      "Upcoming": "upcoming"
    };
    
    const section = sectionMap[sectionType as keyof typeof sectionMap] || "all";
    navigate(`/webinars/${section}`);
  };

  // Dynamic skeleton count based on screen size
  const getSkeletonCount = () => {
    if (typeof window !== "undefined") {
      return Math.min(5, window.innerWidth >= 1536
        ? 5
        : window.innerWidth >= 1280
          ? 4
          : window.innerWidth >= 1024
            ? 3
            : 2);
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

  const renderWebinarSection = (
    title: string, 
    webinars: Webinar[], 
    showRegistered: boolean = false
  ) => {
    // Limit to 5 webinars for dashboard display
    const displayedWebinars = webinars.slice(0, 5);
    const hasMoreWebinars = webinars.length > 5;

    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mt-4 mb-4">
          <h1 className="text-2xl font-bold">
            {title} 
            {webinars.length > 0 && (
              <span className="text-lg font-normal text-gray-500 ml-2">
                ({webinars.length})
              </span>
            )}
          </h1>
          {hasMoreWebinars && (
            <button
              onClick={() => handleLearnMore(title)}
              className="text-blue-500 hover:text-blue-700 transition-colors text-sm font-medium cursor-pointer flex items-center gap-1"
            >
              <span>View all ({webinars.length})</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {isLoading || isLoadingRegistrations ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {renderSkeletonCards()}
          </div>
        ) : displayedWebinars.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {displayedWebinars.map((webinar) => (
                <CardView
                  key={webinar.id}
                  webinar={webinar}
                  isRegistered={showRegistered}
                  onRegister={handleRegister}
                  sectionType={title}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {title === "Registered" 
              ? "You haven't registered for any webinars yet."
              : `No ${title.toLowerCase()} webinars available.`
            }
          </div>
        )}
      </section>
    );
  };

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

  return (
    <DefaultLayout>
      {/* Registered Webinars Section */}
      {registeredWebinarsList.length > 0 && 
        renderWebinarSection("Registered", registeredWebinarsList, true)
      }

      {/* Live Webinars Section */}
      {renderWebinarSection("Live", liveWebinars)}

      {/* Upcoming Webinars Section */}
      {renderWebinarSection("Upcoming", upcomingWebinars)}

      <ToastContainer />
    </DefaultLayout>
  );
}