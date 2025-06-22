import React, { useState, useMemo, useCallback, ChangeEvent, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Input,
  Pagination,
  Button
} from "@heroui/react";
import { CardView } from "@/components/card";
import { Webinar } from "@/api/interface";
import { SearchIcon, ArrowLeftIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";
import { auth_webinar } from "@/api/auth_webinar";
import { auth_participants } from "@/api/auth_participants";
import { toast, ToastContainer } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const DEFAULT_ROWS_PER_PAGE = 10;

const SECTION_TITLES = {
  registered: "Registered Webinars",
  live: "Live Webinars",
  upcoming: "Upcoming Webinars"
} as const;


export default function WebinarSectionPage() {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  
  const [webinarList, setWebinarList] = useState<Webinar[]>([]);
  const [registeredWebinars, setRegisteredWebinars] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  // Validate section parameter
  const validSection = section && ['registered', 'live', 'upcoming'].includes(section) 
    ? section as keyof typeof SECTION_TITLES 
    : 'registered';

  useEffect(() => {
    if (section !== validSection) {
      navigate(`/webinars/${validSection}`, { replace: true });
    }
  }, [section, validSection, navigate]);

  useEffect(() => {
    async function loadWebinarData() {
      try {
        setIsLoading(true);
        const result = await auth_webinar.get_all_webinar();

        if (result.success) {
          const WebinarData = result.data.map((item: any) =>
            Webinar.fromApiResponse(item)
          );
          setWebinarList(WebinarData);
          
          // Load registered webinars from API after getting webinar list
          await loadRegisteredWebinars(WebinarData);
        } else {
          toast.error(result.message || "Failed to load webinar data");
        }
      } catch (error) {
        toast.error("Failed to load webinar data. Please try again later.");
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
    localStorage.setItem("registered_webinars", JSON.stringify(registered));
    setIsLoadingRegistrations(false);
  };

  // Filter webinars by section
  const sectionWebinars = useMemo(() => {
    const now = new Date();
    
    switch (validSection) {
      case 'registered':
        return webinarList.filter(webinar => registeredWebinars.includes(webinar.id));
      
      case 'live':
        return webinarList.filter((webinar) => {
          if (!webinar.dstart || !webinar.dend) return false;
          const startDate = new Date(webinar.dstart);
          const endDate = new Date(webinar.dend);
          return now >= startDate && now <= endDate && !registeredWebinars.includes(webinar.id);
        });
      
      case 'upcoming':
        return webinarList.filter((webinar) => {
          if (!webinar.dstart) return false;
          const startDate = new Date(webinar.dstart);
          return now < startDate;
        });
      
      default:
        return [];
    }
  }, [webinarList, registeredWebinars, validSection]);

  // Filter webinars based on search term
  const filteredWebinars = useMemo(() => {
    if (!searchTerm) return sectionWebinars;
    
    return sectionWebinars.filter((webinar) =>
      webinar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webinar.speaker?.toLowerCase().includes(searchTerm.toLowerCase()) 
    );
  }, [sectionWebinars, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredWebinars.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedWebinars = filteredWebinars.slice(startIndex, startIndex + rowsPerPage);

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

  // Handlers
  const handleSearchChange = useCallback((value?: string) => {
    setSearchTerm(value || "");
    setCurrentPage(1);
  }, []);

  const handleRowsPerPageChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  }, []);

  // Get current timestamp
  const getCurrentTimestamp = () => {
    return "2025-06-22 16:14:38";
  };

  // Dynamic skeleton count
  const getSkeletonCount = () => {
    return Math.min(rowsPerPage, 12);
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

  const topContent = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            classNames={{
              base: "w-full sm:max-w-[60%]",
              inputWrapper: "border-1",
            }}
            placeholder="Search webinars by name, or speaker.."
            size="sm"
            startContent={<SearchIcon className="text-default-300" />}
            value={searchTerm}
            variant="bordered"
            onClear={() => setSearchTerm("")}
            onValueChange={handleSearchChange}
            isDisabled={isLoading}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {isLoading ? "..." : filteredWebinars.length} webinar{filteredWebinars.length !== 1 ? 's' : ''} found
          </span>

          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small ml-2"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              disabled={isLoading}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </select>
          </label>
        </div>
      </div>
    ),
    [searchTerm, handleSearchChange, filteredWebinars.length, rowsPerPage, handleRowsPerPageChange, isLoading]
  );

  const bottomContent = useMemo(
    () => (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="text-default-400 text-small">
          Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredWebinars.length)} of {filteredWebinars.length} webinars
        </span>
        <Pagination
          showControls
          classNames={{ cursor: "bg-foreground text-background" }}
          color="default"
          page={currentPage}
          total={totalPages}
          variant="light"
          onChange={setCurrentPage}
          isDisabled={isLoading}
        />
      </div>
    ),
    [currentPage, totalPages, startIndex, rowsPerPage, filteredWebinars.length, isLoading]
  );

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link to="/dashboard" className="text-blue-500 hover:text-blue-700 transition-colors">
              Dashboard
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 capitalize">{validSection} Webinars</span>
          </div>

          {/* Page Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {SECTION_TITLES[validSection]}
              </h1>
            </div>
            
            <Link to="/dashboard">
              <Button
                variant="bordered"
                startContent={<ArrowLeftIcon />}
                size="sm"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Section Navigation */}
          <div className="flex gap-2 flex-wrap">
            {Object.entries(SECTION_TITLES).map(([key, title]) => (
              <Link key={key} to={`/webinars/${key}`}>
                <Button
                  variant={validSection === key ? "solid" : "bordered"}
                  color={validSection === key ? "primary" : "default"}
                  size="sm"
                >
                  {title}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Content */}
        {topContent}

        {/* Content Area */}
        {isLoading || isLoadingRegistrations ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {renderSkeletonCards()}
          </div>
        ) : paginatedWebinars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {paginatedWebinars.map((webinar) => (
              <CardView
                key={webinar.id}
                webinar={webinar}
                isRegistered={validSection === 'registered'}
                onRegister={handleRegister}
                sectionType={validSection === 'upcoming' ? 'Upcoming' : validSection === 'live' ? 'Live' : 'Registered'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? (
              <div>
                <p className="text-lg mb-2">No webinars found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
                <Button
                  size="sm"
                  variant="bordered"
                  className="mt-4"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-lg mb-2">
                  {validSection === 'registered' 
                    ? "You haven't registered for any webinars yet."
                    : `No ${validSection} webinars available.`
                  }
                </p>
                <p className="text-sm">
                  {validSection === 'registered' 
                    ? "Browse live or upcoming webinars to register."
                    : "Check back later for new webinars."
                  }
                </p>
                {validSection === 'registered' && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Link to="/webinars/live">
                      <Button size="sm" color="primary">
                        Browse Live Webinars
                      </Button>
                    </Link>
                    <Link to="/webinars/upcoming">
                      <Button size="sm" variant="bordered">
                        Browse Upcoming Webinars
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bottom Content */}
        {totalPages > 1 && bottomContent}
      </div>

      <ToastContainer />
    </DefaultLayout>
  );
}