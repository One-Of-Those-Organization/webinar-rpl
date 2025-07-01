import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  ChangeEvent,
  Key,
} from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  User,
  Pagination,
  Selection,
  ChipProps,
  SortDescriptor,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  ChevronDownIcon,
  PlusIcon,
  SearchIcon,
  VerticalDotsIcon,
} from "./icons";
import { auth_user } from "@/api/auth_user";
import { Users } from "@/api/interface";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// ===== CONSTANTS =====
const USER_ROLES = {
  ADMIN: 1,
  USER: 2,
} as const;

const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: "Admin",
  [USER_ROLES.USER]: "User",
} as const;

const ROLE_COLORS: Record<string, ChipProps["color"]> = {
  Admin: "primary",
  User: "success",
};

const TABLE_COLUMNS = [
  { name: "ID", uid: "id", sortable: true },
  { name: "NAME", uid: "name", sortable: true },
  { name: "ROLE", uid: "role", sortable: true },
  { name: "EMAIL", uid: "email", sortable: false },
  { name: "INSTANSI", uid: "instansi", sortable: true },
  { name: "ACTIONS", uid: "actions", sortable: false },
];

const VISIBLE_COLUMNS = ["name", "role", "email", "instansi", "actions"];

const DEFAULT_ROWS_PER_PAGE = 5;
const DEFAULT_AVATAR = "/logo_if.png";

export default function UserManagementTable() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<Users[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Users | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });

  const {
    isOpen: isDeleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        setIsLoading(true);
        const response = await auth_user.get_all_users();

        if (response.success && response.data) {
          const transformedUsers = response.data.map((user: any) => ({
            id: user.ID,
            name: user.UserFullName,
            role:
              ROLE_LABELS[user.UserRole as keyof typeof ROLE_LABELS] || "User",
            email: user.UserEmail,
            instansi: user.UserInstance || "-",
            avatar: user.UserPicture || DEFAULT_AVATAR,
          }));
          setUsers(transformedUsers);
        } else {
          toast.error("Failed to fetch users data");
        }
      } catch (error) {
        toast.error("Network error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsersData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return TABLE_COLUMNS;
    return TABLE_COLUMNS.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredUsers = useMemo(() => {
    if (!searchValue) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.role.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.instansi.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [users, searchValue]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [currentPage, filteredUsers, rowsPerPage]);

  const sortedUsers = useMemo(() => {
    return [...paginatedUsers].sort((a: Users, b: Users) => {
      const firstValue = a[sortDescriptor.column as keyof Users];
      const secondValue = b[sortDescriptor.column as keyof Users];
      const comparison = String(firstValue).localeCompare(String(secondValue));
      return sortDescriptor.direction === "descending"
        ? -comparison
        : comparison;
    });
  }, [sortDescriptor, paginatedUsers]);

  const handleEditUser = (user: Users) => {
    navigate(`/admin/user/edit/${encodeURIComponent(user.email)}`);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      const response = await auth_user.user_del_admin({ id: userToDelete.id });

      if (response.success) {
        toast.success("User deleted successfully");
        const updatedUsers = users.filter(
          (user) => user.id !== userToDelete.id,
        );
        setUsers(updatedUsers);

        const newFilteredUsers = updatedUsers.filter((user) =>
          searchValue
            ? user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
              user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
              user.instansi.toLowerCase().includes(searchValue.toLowerCase()) ||
              user.role.toLowerCase().includes(searchValue.toLowerCase())
            : true,
        );
        const newTotalPages = Math.ceil(newFilteredUsers.length / rowsPerPage);

        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(1);
        }
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("Failed to connect to server");
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
      setUserToDelete(null);
    }
  };

  const handleRowsPerPageChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
    },
    [],
  );

  const handleSearchChange = useCallback((value?: string) => {
    setSearchValue(value || "");
    setCurrentPage(1);
  }, []);

  const handleOpenDeleteModal = useCallback(
    (user: Users) => {
      setUserToDelete(user);
      openDeleteModal();
    },
    [openDeleteModal],
  );

  const renderUserCell = useCallback(
    (user: Users, columnKey: Key) => {
      const cellValue = user[columnKey as keyof Users];

      switch (columnKey) {
        case "name":
          return (
            <User
              avatarProps={{ radius: "full", size: "sm", src: user.avatar }}
              classNames={{ description: "text-default-500" }}
              name={String(cellValue)}
            />
          );

        case "role":
          return (
            <Chip
              className="capitalize border-none gap-1 text-default-600"
              color={ROLE_COLORS[user.role] || "default"}
              size="sm"
              variant="dot"
            >
              {String(cellValue)}
            </Chip>
          );

        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    radius="full"
                    size="sm"
                    variant="light"
                    isDisabled={isDeleting}
                  >
                    <VerticalDotsIcon className="text-default-400" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem key="edit" onClick={() => handleEditUser(user)}>
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    onClick={() => handleOpenDeleteModal(user)}
                    className="text-danger"
                  >
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );

        default:
          return cellValue ? String(cellValue) : "-";
      }
    },
    [isDeleting, handleOpenDeleteModal],
  );

  const topContent = useMemo(
    () => (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-end w-full">
          <Input
            isClearable
            classNames={{
              base: "w-full sm:max-w-[44%]",
              inputWrapper: "border-1",
            }}
            placeholder="Search by name, role, email or instansi..."
            size="sm"
            startContent={<SearchIcon className="text-default-300" />}
            value={searchValue}
            variant="bordered"
            onClear={() => setSearchValue("")}
            onValueChange={handleSearchChange}
            isDisabled={isLoading}
          />

          <div className="flex gap-3 w-full sm:w-auto">
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
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {TABLE_COLUMNS.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Link to="/admin/user/add" className="w-full sm:w-auto">
              <Button
                className="bg-foreground text-background w-full sm:w-auto"
                endContent={<PlusIcon />}
                size="sm"
                isDisabled={isLoading}
              >
                Tambah User
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center w-full">
          <span className="text-default-400 text-small">
            Total {isLoading ? "..." : users.length} users
          </span>

          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small ml-2"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              disabled={isLoading}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    ),
    [
      searchValue,
      visibleColumns,
      handleSearchChange,
      handleRowsPerPageChange,
      users.length,
      rowsPerPage,
      isLoading,
    ],
  );

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
    [currentPage, totalPages, isLoading],
  );

  // ===== LOADING STATE =====
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Only show horizontal scroll on small screens (max-width: 1023px) */}
      <div className="overflow-x-auto lg:overflow-x-visible">
        <Table
          isCompact
          removeWrapper
          aria-label="User management table"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          sortDescriptor={sortDescriptor}
          topContent={topContent}
          topContentPlacement="outside"
          onSortChange={setSortDescriptor}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>

          <TableBody emptyContent="No users found" items={sortedUsers}>
            {(user) => (
              <TableRow key={user.id}>
                {(columnKey) => (
                  <TableCell>{renderUserCell(user, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <ModalContent>
          <ModalHeader className="flex flex-col text-center">
            Confirm Deletion
          </ModalHeader>

          <ModalBody>
            <p>
              Are you sure you want to delete user:{" "}
              <strong>{userToDelete?.name}</strong>?
            </p>
            <p className="text-danger">This action cannot be undone.</p>
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button
              color="danger"
              onClick={handleDeleteUser}
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
