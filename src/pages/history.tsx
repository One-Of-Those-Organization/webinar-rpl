import DefaultLayout from "@/layouts/default";
import { CardView } from "@/components/card_history";
import { useState, useEffect, useMemo } from "react";
import { Webinar } from "@/api/interface";
import { auth_participants } from "@/api/auth_participants";
import { auth_user } from "@/api/auth_user";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { EmptyWebinarIcon } from "@/components/icons";

// Pagination options
const ROWS_PER_PAGE_OPTIONS = [5, 10, 15];

// History Webinar Page

export default function ParticipantsPage() {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [webinarList, setWebinarList] = useState<Webinar[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);

  // User email state
  const [email, setEmail] = useState("");

  // Fetch user email
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await auth_user.get_current_user();
        if (response.success && response.data) {
          setEmail(response.data.UserEmail || "");
        } else {
          toast.error("Failed to fetch user data. Please log in again.");
        }
      } catch (error) {
        toast.error("Failed to fetch user data. Please try again later.");
      }
    };
    fetchUserData();
  }, []);

  // Fetch webinars user has participated in
  useEffect(() => {
    const fetchWebinars = async () => {
      if (!email) return;
      setIsLoading(true);
      try {
        setError(null);
        const response =
          await auth_participants.event_participate_by_user(email);
        if (response.success) {
          const mapped = (response.data || []).map((apiData: any) =>
            Webinar.fromApiResponse(apiData)
          );
          setWebinarList(mapped);
        } else {
          const errorMessage = response.message || "Gagal memuat data webinar";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (error) {
        const errorMessage =
          "Failed to fetch webinars. Please try again later.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWebinars();
  }, [email]);

  // Filter
  const filteredWebinars = useMemo(() => {
    if (!searchValue) return webinarList;
    const query = searchValue.toLowerCase();
    return webinarList.filter(
      (webinar) =>
        (webinar.name || "").toLowerCase().includes(query) ||
        (webinar.speaker || "").toLowerCase().includes(query) ||
        (webinar.description || "").toLowerCase().includes(query)
    );
  }, [searchValue, webinarList]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredWebinars.length / rowsPerPage)
  );
  const paginatedWebinars = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredWebinars.slice(start, start + rowsPerPage);
  }, [filteredWebinars, page, rowsPerPage]);

  // Dynamic skeleton count
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
      </DefaultLayout>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="mb-6 flex justify-end">
          <input
            type="text"
            className="border px-3 py-2 rounded w-full max-w-xs"
            placeholder="Search webinars..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-8">
          <section className="mb-8">
            <div className="flex items-center justify-between mt-4 mb-4">
              <Skeleton height={32} width={100} />
              <Skeleton height={16} width={100} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {renderSkeletonCards()}
            </div>
          </section>
        </div>
      </DefaultLayout>
    );
  }

  // Main render
  return (
    <DefaultLayout>
      {/* Search Bar */}
      <div className="mb-6 flex justify-end">
        <input
          type="text"
          className="border px-3 py-2 rounded w-full max-w-xs"
          placeholder="Search webinars..."
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setPage(1);
          }}
          disabled={isLoading}
        />
      </div>

      {/* Webinar History Section */}
      <section className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">History Webinar</h1>
          </div>
          <div className="flex gap-2 items-center">
            <select
              className="border rounded px-2 py-1 text-sm"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
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
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>
              <span className="text-xs text-gray-600">
                Page {page} / {totalPages}
              </span>
              <button
                className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {paginatedWebinars.map((webinar) => (
            <CardView key={webinar.id} webinar={webinar} />
          ))}
        </div>
        {filteredWebinars.length === 0 && !isLoading && (
          <EmptyState
            title="No Webinar History"
            desc="You have not participated in any webinars yet."
          />
        )}
      </section>
    </DefaultLayout>
  );
}
