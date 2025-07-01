import DefaultLayout from "@/layouts/default_admin";
import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Avatar,
  Tooltip,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
} from "@heroui/react";
import { useParams, useNavigate } from "react-router-dom";
import { auth_participants } from "@/api/auth_participants";
import { auth_webinar } from "@/api/auth_webinar";
import { SearchIcon, ChevronDownIcon } from "@/components/icons";
import { toast, ToastContainer } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Default rows per page and options for participants
const DEFAULT_ROWS_PER_PAGE = 8;
const PARTICIPANTS_PER_PAGE_OPTIONS = [8, 12, 16, 20];

export default function ListPartisipantPage() {
  const { eventId } = useParams();
  const parsedId = eventId ? parseInt(eventId, 10) : null;
  const navigate = useNavigate();

  // State untuk cek apakah user committee, data peserta, nama webinar, search/pagination
  const [isCommittee, setIsCommittee] = useState<boolean>(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [webinarName, setWebinarName] = useState<string>("");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);

  // Committee check
  useEffect(() => {
    if (parsedId) {
      const checkCommittee = async () => {
        try {
          const result =
            await auth_participants.event_participate_info(parsedId);
          if (
            result.success &&
            result.data &&
            result.data.EventPRole === "committee"
          ) {
            setIsCommittee(true);
          } else {
            setIsCommittee(false);
          }
        } catch {
          setIsCommittee(false);
          toast.error("Failed to check committee status.");
        }
      };
      checkCommittee();
    }
  }, [parsedId]);

  // Participants fetch
  useEffect(() => {
    setIsLoading(true);
    const fetchParticipants = async () => {
      if (parsedId) {
        const response =
          await auth_participants.get_participants_by_event(parsedId);
        if (response.success) {
          setParticipants(response.data);
        } else {
          toast.error("Failed to fetch participants.");
        }
        setIsLoading(false);
      }
    };
    fetchParticipants();
  }, [parsedId]);

  // Webinar name fetch
  useEffect(() => {
    const fetchWebinarData = async () => {
      if (parsedId) {
        const response = await auth_webinar.get_webinar_by_id(parsedId);
        if (response.success) {
          setWebinarName(response.data.EventName || "Unknown Webinar");
        } else {
          toast.error("Failed to fetch webinar data.");
        }
      }
    };
    fetchWebinarData();
  }, [parsedId]);

  // Search and Pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, rowsPerPage]);

  // Filter peserta berdasarkan search
  const filteredParticipants = useMemo(() => {
    if (!searchValue) return participants;
    const q = searchValue.toLowerCase();
    return participants.filter((p) => {
      const name = (p.User?.UserFullName || p.UserFullName || "").toLowerCase();
      const email = (p.User?.UserEmail || p.UserEmail || "").toLowerCase();
      const instance = (
        p.User?.UserInstance ||
        p.UserInstance ||
        ""
      ).toLowerCase();
      const role = (p.EventPRole || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        instance.includes(q) ||
        role.includes(q)
      );
    });
  }, [participants, searchValue]);

  // Kalau bukan panitia, jangan lanjutkan
  if (!isCommittee) {
    navigate("/dashboard");
  }

  // Pagination peserta
  const totalPages = Math.max(
    1,
    Math.ceil(filteredParticipants.length / rowsPerPage),
  );

  const paginatedParticipants = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return filteredParticipants.slice(startIdx, endIdx);
  }, [filteredParticipants, currentPage, rowsPerPage]);

  // Top controls
  const topContent = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between gap-3 md:items-end">
          <Input
            isClearable
            classNames={{
              base: "w-full md:max-w-[44%]",
              inputWrapper: "border-1",
            }}
            placeholder="Cari nama, email, institusi, atau role peserta..."
            size="sm"
            startContent={<SearchIcon className="text-default-300" />}
            value={searchValue}
            variant="bordered"
            onClear={() => setSearchValue("")}
            onValueChange={(v) => setSearchValue(v || "")}
            isDisabled={isLoading}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden md:flex">
                <button
                  className="inline-flex items-center px-3 py-2 text-sm rounded bg-default-100 hover:bg-default-200 transition"
                  disabled={isLoading}
                >
                  <span>Rows per page</span>
                  <ChevronDownIcon className="ml-1 text-xs" />
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Participants per page"
                onAction={(key) => setRowsPerPage(Number(key))}
              >
                {PARTICIPANTS_PER_PAGE_OPTIONS.map((option) => (
                  <DropdownItem key={option}>{option} per page</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {isLoading ? "..." : filteredParticipants.length} participants
            {searchValue && !isLoading && (
              <span className="ml-1">
                (filtered from {participants.length})
              </span>
            )}
          </span>
          <span className="text-default-400 text-small">
            Showing {isLoading ? "..." : paginatedParticipants.length} of{" "}
            {isLoading ? "..." : filteredParticipants.length}
          </span>
        </div>
      </div>
    ),
    [
      searchValue,
      isLoading,
      filteredParticipants.length,
      participants.length,
      paginatedParticipants.length,
    ],
  );

  // Pagination bottom
  const bottomContent = useMemo(
    () =>
      totalPages > 1 && (
        <div className="py-2 px-2 flex justify-center items-center">
          <Pagination
            showControls
            classNames={{ cursor: "bg-foreground text-background" }}
            color="default"
            isDisabled={isLoading}
            page={currentPage}
            total={totalPages}
            variant="light"
            onChange={setCurrentPage}
          />
        </div>
      ),
    [currentPage, totalPages, isLoading],
  );

  // Skeleton loader
  const renderSkeletonCards = () =>
    Array(rowsPerPage)
      .fill(0)
      .map((_, i) => (
        <Card key={i} className="h-full flex flex-col gap-2 p-5 shadow">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton circle height={48} width={48} />
            <div className="flex-1">
              <Skeleton height={22} width="70%" />
              <Skeleton height={16} width="60%" />
            </div>
          </div>
          <Skeleton height={14} width="90%" className="mb-1" />
          <Skeleton height={16} width="60%" className="mb-1" />
          <Skeleton height={14} width="40%" />
        </Card>
      ));

  // Jika bukan committee, jangan render apapun
  if (!isCommittee) return;

  return (
    <DefaultLayout>
      <section>
        {/* Header */}
        <div className="mb-6 flex flex-col items-center gap-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center">
            List Participant Webinar{" "}
            <span className="text-primary">"{webinarName}"</span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Berikut adalah daftar peserta yang terdaftar pada webinar ini.
          </p>
        </div>
        {/* Top Controls */}
        <div className="mb-6">{topContent}</div>
        {/* Pagination Atas (Mobile Only) */}
        {!isLoading && totalPages > 1 && (
          <div className="block md:hidden mb-4">{bottomContent}</div>
        )}
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            renderSkeletonCards()
          ) : paginatedParticipants.length > 0 ? (
            paginatedParticipants.map((p, idx) => (
              <Card
                key={p.ID || idx}
                className="h-full flex flex-col gap-2 p-5 shadow relative transition-all hover:shadow-xl bg-white"
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-3 mb-2">
                  <Avatar
                    size="md"
                    src={p.User?.UserPicture}
                    name={p.User?.UserFullName || p.UserFullName || "-"}
                    isBordered
                    color={p.EventPRole === "committee" ? "success" : "primary"}
                  />
                  <div className="flex-1 min-w-0">
                    <Tooltip
                      content={p.User?.UserFullName || p.UserFullName || "-"}
                      placement="top"
                    >
                      <div className="font-bold text-base truncate">
                        {p.User?.UserFullName || p.UserFullName || "-"}
                      </div>
                    </Tooltip>
                    <div className="text-xs text-gray-500 truncate">
                      {p.User?.UserInstance || p.UserInstance || "-"}
                    </div>
                  </div>
                </div>
                {/* Email */}
                <div className="text-sm text-gray-600 break-all whitespace-normal mb-1">
                  {p.User?.UserEmail || p.UserEmail || "-"}
                </div>
                {/* Tipe */}
                <div className="text-xs mb-1 font-medium text-gray-700">
                  Tipe:{" "}
                  <span
                    className={
                      p.EventPRole === "committee"
                        ? "text-emerald-600"
                        : "text-blue-600"
                    }
                  >
                    {p.EventPRole === "committee" ? "Committee" : "Participant"}
                  </span>
                </div>
                {/* Status */}
                <div className="flex items-center gap-1 mt-auto">
                  <span className="text-xs">Status:</span>
                  <span
                    className={
                      p.EventPCome
                        ? "text-green-600 text-xs font-semibold"
                        : "text-gray-400 text-xs"
                    }
                  >
                    {p.EventPCome ? "Hadir" : "Belum Hadir"}
                  </span>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="text-5xl mb-4">🙅‍♂️</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchValue
                  ? "No participants found"
                  : "No participants available"}
              </h3>
              <p className="text-default-500">
                {searchValue
                  ? `Tidak ditemukan peserta dengan kata kunci "${searchValue}".`
                  : "Belum ada peserta terdaftar untuk webinar ini."}
              </p>
            </div>
          )}
        </div>
        {/* Pagination bawah (desktop) */}
        {!isLoading && totalPages > 1 && (
          <div className="hidden md:block mt-8">{bottomContent}</div>
        )}
        <ToastContainer />
      </section>
    </DefaultLayout>
  );
}
