// IMPLEMENTATION DONE (DO NOT EDIT THIS FILE ANYMORE)

import DefaultLayout from "@/layouts/default";
import { CardView } from "@/components/card";
import { useState, useEffect, useMemo } from "react";
import { auth_webinar } from "@/api/auth_webinar";
import { Webinar } from "@/api/interface";
import { toast, ToastContainer } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { EmptyWebinarIcon } from "@/components/icons";

// Detail Page

const ROWS_PER_PAGE_OPTIONS = [5, 10, 15];

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [webinarList, setWebinarList] = useState<Webinar[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");

  // Pagination states for Live
  const [livePage, setLivePage] = useState(1);
  const [liveRowsPerPage, setLiveRowsPerPage] = useState(
    ROWS_PER_PAGE_OPTIONS[0],
  );

  // Pagination states for Upcoming
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [upcomingRowsPerPage, setUpcomingRowsPerPage] = useState(
    ROWS_PER_PAGE_OPTIONS[0],
  );

  // Load webinar data on component mount
  useEffect(() => {
    async function loadWebinarData() {
      try {
        setError(null);
        const result = await auth_webinar.get_all_webinar();

        if (result.success) {
          const WebinarData = result.data.map((item: any) =>
            Webinar.fromApiResponse(item),
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

  // Search handler
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setLivePage(1);
    setUpcomingPage(1);
  };

  // Filtered webinars based on search for both sections
  const filteredLiveWebinars = useMemo(() => {
    if (!searchValue) return liveWebinars;
    const query = searchValue.toLowerCase();
    return liveWebinars.filter(
      (webinar) =>
        (webinar.name || "").toLowerCase().includes(query) ||
        (webinar.speaker || "").toLowerCase().includes(query) ||
        (webinar.description || "").toLowerCase().includes(query),
    );
  }, [searchValue, liveWebinars]);

  const filteredUpcomingWebinars = useMemo(() => {
    if (!searchValue) return upcomingWebinars;
    const query = searchValue.toLowerCase();
    return upcomingWebinars.filter(
      (webinar) =>
        (webinar.name || "").toLowerCase().includes(query) ||
        (webinar.speaker || "").toLowerCase().includes(query) ||
        (webinar.description || "").toLowerCase().includes(query),
    );
  }, [searchValue, upcomingWebinars]);

  // Pagination for Live
  const totalLivePages = Math.max(
    1,
    Math.ceil(filteredLiveWebinars.length / liveRowsPerPage),
  );
  const paginatedLiveWebinars = useMemo(() => {
    const start = (livePage - 1) * liveRowsPerPage;
    return filteredLiveWebinars.slice(start, start + liveRowsPerPage);
  }, [filteredLiveWebinars, livePage, liveRowsPerPage]);

  // Pagination for Upcoming
  const totalUpcomingPages = Math.max(
    1,
    Math.ceil(filteredUpcomingWebinars.length / upcomingRowsPerPage),
  );
  const paginatedUpcomingWebinars = useMemo(() => {
    const start = (upcomingPage - 1) * upcomingRowsPerPage;
    return filteredUpcomingWebinars.slice(start, start + upcomingRowsPerPage);
  }, [filteredUpcomingWebinars, upcomingPage, upcomingRowsPerPage]);

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

  // Render skeleton cards for loading state
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

  // Simple empty state illustration
  const EmptyState = ({ title, desc }: { title: string; desc: string }) => (
    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
      <EmptyWebinarIcon />
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-sm">{desc}</div>
    </div>
  );

  // Render webinar section with title, webinars, and empty state
  const renderWebinarSection = (opts: {
    title: string;
    webinars: Webinar[];
    paginated: Webinar[];
    empty: { title: string; desc: string };
    page: number;
    setPage: (page: number) => void;
    totalPages: number;
    rowsPerPage: number;
    setRowsPerPage: (rows: number) => void;
  }) => (
    <section className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{opts.title}</h1>
        </div>
        {/* pagination & filter */}
        <div className="flex gap-2 items-center">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={opts.rowsPerPage}
            onChange={(e) => {
              opts.setRowsPerPage(Number(e.target.value));
              opts.setPage(1);
            }}
          >
            {ROWS_PER_PAGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / page
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <button
              className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs"
              disabled={opts.page === 1}
              onClick={() => opts.setPage(opts.page - 1)}
            >
              Prev
            </button>
            <span className="text-xs text-gray-600">
              Page {opts.page} / {opts.totalPages}
            </span>
            <button
              className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs"
              disabled={opts.page === opts.totalPages}
              onClick={() => opts.setPage(opts.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {opts.paginated.map((webinar) => (
          <CardView key={webinar.id} webinar={webinar} />
        ))}
      </div>
      {opts.webinars.length === 0 && !isLoading && (
        <EmptyState title={opts.empty.title} desc={opts.empty.desc} />
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
        <div className="mb-6 w-full flex justify-center md:justify-end">
          <input
            type="text"
            className="border px-3 py-2 rounded w-full max-w-xs"
            placeholder="Search webinars..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-8">
          {/* Live Webinars Skeleton */}
          <section className="mb-8">
            <div className="flex items-center justify-between mt-4 mb-4">
              <Skeleton height={32} width={100} />
              <Skeleton height={16} width={100} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {renderSkeletonCards()}
            </div>
          </section>

          {/* Upcoming Webinars Skeleton */}
          <section className="mb-8">
            <div className="flex items-center justify-between mt-4 mb-4">
              <Skeleton height={32} width={140} />
              <Skeleton height={16} width={100} />
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

  // Render main content with live and upcoming webinars
  return (
    <DefaultLayout>
      {/* Search Bar */}
      <div className="mb-6 flex justify-end">
        <input
          type="text"
          className="border px-3 py-2 rounded w-full max-w-xs"
          placeholder="Search webinars..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Live Webinars Section */}
      {renderWebinarSection({
        title: "Live",
        webinars: filteredLiveWebinars,
        paginated: paginatedLiveWebinars,
        empty: {
          title: "No Live Webinars",
          desc: "There are no live webinars at the moment. Check back soon or explore upcoming events!",
        },
        page: livePage,
        setPage: setLivePage,
        totalPages: totalLivePages,
        rowsPerPage: liveRowsPerPage,
        setRowsPerPage: setLiveRowsPerPage,
      })}

      {/* Upcoming Webinars Section */}
      {renderWebinarSection({
        title: "Upcoming",
        webinars: filteredUpcomingWebinars,
        paginated: paginatedUpcomingWebinars,
        empty: {
          title: "No Upcoming Webinars",
          desc: "No webinars are scheduled yet. Stay tuned for new events!",
        },
        page: upcomingPage,
        setPage: setUpcomingPage,
        totalPages: totalUpcomingPages,
        rowsPerPage: upcomingRowsPerPage,
        setRowsPerPage: setUpcomingRowsPerPage,
      })}

      <ToastContainer />
    </DefaultLayout>
  );
}
