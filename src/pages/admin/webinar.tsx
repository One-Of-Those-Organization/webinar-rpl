import DefaultLayout from "@/layouts/default_admin";
import CreateWebinar from "@/pages/admin/add_webinar";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardHeader,
  Image,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import {
  EditIcon,
  TrashIcon,
  SearchIcon,
  ChevronDownIcon,
} from "@/components/icons";
import { auth_webinar } from "@/api/auth_webinar";
import { Webinar } from "@/api/interface";
import { toast, ToastContainer } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const DEFAULT_ROWS_PER_PAGE = 8;
const WEBINARS_PER_PAGE_OPTIONS = [8, 12, 16, 20];

export default function WebinarPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [webinarList, setWebinarList] = useState<Webinar[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>(
    {}
  );

  // State untuk delete confirmation
  const [webinarToDelete, setWebinarToDelete] = useState<Webinar | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // HeroUI modal hooks
  const {
    isOpen: isDeleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();

  useEffect(() => {
    async function loadWebinarData() {
      try {
        const result = await auth_webinar.get_all_webinar();

        if (result.success) {
          const WebinarData = result.data.map((item: any) => {
            const webinar = Webinar.fromApiResponse(item);
            setImageLoading((prev) => ({
              ...prev,
              [webinar.id || item.ID]: true,
            }));
            return webinar;
          });
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
  }, []);

  // Reset page when rows per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage]);

  // Filtered webinars based on search
  const filteredWebinars = useMemo(() => {
    if (!searchValue) return webinarList;
    return webinarList.filter((webinar) => {
      const query = searchValue.toLowerCase();
      const name = (webinar.name || "").toLowerCase();
      const speaker = (webinar.speaker || "").toLowerCase();
      const description = (webinar.description || "").toLowerCase();

      return (
        name.includes(query) ||
        speaker.includes(query) ||
        description.includes(query)
      );
    });
  }, [webinarList, searchValue]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredWebinars.length / rowsPerPage);

  const paginatedWebinars = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredWebinars.slice(startIndex, endIndex);
  }, [currentPage, filteredWebinars, rowsPerPage]);

  // Search handler
  const handleSearchChange = useCallback((value?: string) => {
    setSearchValue(value || "");
    setCurrentPage(1);
  }, []);

  // Rows per page handler
  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  }, []);

  // Function untuk render skeleton cards saat loading
  const renderSkeletonCards = () => {
    return Array(rowsPerPage)
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

  // Function untuk handling image load
  const handleImageLoad = (webinarId: string | number) => {
    setImageLoading((prev) => ({ ...prev, [webinarId]: false }));
  };

  // Function untuk get webinar by ID and navigate to edit page
  const handleEditWebinar = (webinar: Webinar) => {
    navigate(`/admin/edit_webinar/${webinar.id}`);
  };

  // Function untuk show delete confirmation
  const handleOpenDeleteModal = useCallback(
    (webinar: Webinar) => {
      setWebinarToDelete(webinar);
      openDeleteModal();
    },
    [openDeleteModal]
  );

  // Function untuk close modal dan reset state
  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setWebinarToDelete(null);
      closeDeleteModal();
    }
  };

  // Function untuk delete webinar
  const handleDeleteWebinar = async () => {
    if (!webinarToDelete || isDeleting) return;

    try {
      setIsDeleting(true);
      const result = await auth_webinar.delete_webinar({
        id: webinarToDelete.id || 0,
      });

      if (result.success) {
        toast.success("Webinar successfully deleted");

        // Update local state
        const updatedWebinars = webinarList.filter(
          (webinar) => webinar.id !== webinarToDelete.id
        );
        setWebinarList(updatedWebinars);

        // Handle pagination after deletion
        const newFilteredWebinars = updatedWebinars.filter((webinar) =>
          searchValue
            ? webinar.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
              webinar.speaker
                ?.toLowerCase()
                .includes(searchValue.toLowerCase()) ||
              webinar.description
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())
            : true
        );
        const newTotalPages = Math.ceil(
          newFilteredWebinars.length / rowsPerPage
        );

        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(1);
        }

        handleCloseDeleteModal();
      } else {
        toast.error(result.message || "Failed to delete webinar");
      }
    } catch (error) {
      toast.error("There was an error deleting the webinar. Please try again.");
    } finally {
      setIsDeleting(false);
    }
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

  // Top content - sama seperti User Management Table
  const topContent = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            classNames={{
              base: "w-full sm:max-w-[44%]",
              inputWrapper: "border-1",
            }}
            placeholder="Search webinars by name, speaker, or description..."
            size="sm"
            startContent={<SearchIcon className="text-default-300" />}
            value={searchValue}
            variant="bordered"
            onClear={() => setSearchValue("")}
            onValueChange={handleSearchChange}
            isDisabled={isLoading}
          />

          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  size="sm"
                  variant="flat"
                  isDisabled={isLoading}
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Webinars per page"
                onAction={(key) => handleRowsPerPageChange(Number(key))}
              >
                {WEBINARS_PER_PAGE_OPTIONS.map((option) => (
                  <DropdownItem key={option}>{option} per page</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <CreateWebinar />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {isLoading ? "..." : filteredWebinars.length} webinars
            {searchValue && !isLoading && (
              <span className="ml-1">(filtered from {webinarList.length})</span>
            )}
          </span>

          <span className="text-default-400 text-small">
            Showing {isLoading ? "..." : paginatedWebinars.length} of{" "}
            {isLoading ? "..." : filteredWebinars.length}
          </span>
        </div>
      </div>
    ),
    [
      searchValue,
      handleSearchChange,
      handleRowsPerPageChange,
      filteredWebinars.length,
      webinarList.length,
      paginatedWebinars.length,
      isLoading,
    ]
  );

  // Bottom content - pagination
  const bottomContent = useMemo(
    () => (
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
    [currentPage, totalPages, isLoading]
  );

  return (
    <DefaultLayout>
      <section>
        {/* Top Content */}
        <div className="mb-6">{topContent}</div>

        {/* Webinar Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {renderSkeletonCards()}
          </div>
        ) : paginatedWebinars && paginatedWebinars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedWebinars.map((webinar, index) => (
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
                  <p className="text-xs uppercase font-bold text-gray-700 dark:text-gray-300 truncate">
                    {webinar.speaker || "Pembicara tidak tersedia"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(webinar.dstart)}
                  </p>
                  {webinar.description && (
                    <p
                      className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2"
                      title={webinar.description}
                    >
                      {webinar.description}
                    </p>
                  )}
                </CardHeader>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex space-x-2">
                    <button
                      className="flex-1 flex justify-center items-center bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                      onClick={() => handleEditWebinar(webinar)}
                    >
                      <EditIcon size={14} className="mr-1" />
                      <span>View</span>
                    </button>
                    <button
                      className="flex-1 flex justify-center items-center bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                      onClick={() => handleOpenDeleteModal(webinar)}
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
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            {searchValue
              ? `No webinars found matching "${searchValue}"`
              : "Tidak ada webinar yang tersedia."}
          </div>
        )}

        {/* Bottom Content - Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-6">{bottomContent}</div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal}>
          <ModalContent>
            <ModalHeader className="flex flex-col text-center">
              Konfirmasi Hapus Webinar
            </ModalHeader>

            <ModalBody>
              <p>
                Apakah Anda yakin ingin menghapus webinar:{" "}
                <strong>{webinarToDelete?.name}</strong>?
              </p>
              <p className="text-danger">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="light"
                onPress={handleCloseDeleteModal}
                isDisabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                color="danger"
                onPress={handleDeleteWebinar}
                isLoading={isDeleting}
                isDisabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </section>
      <ToastContainer />
    </DefaultLayout>
  );
}
