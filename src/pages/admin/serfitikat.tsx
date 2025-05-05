import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default_admin";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  ChipProps,
  Input,
  Pagination
} from "@heroui/react";
import React from "react";


const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    nim: "123456789",
    attendance: "present", 
    claimStatus: "claimed", 
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    nim: "987654321",
    attendance: "present",
    claimStatus: "unclaimed",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    nim: "456123789",
    attendance: "absent",
    claimStatus: null,
  },
  {
    id: 4,
    name: "Alice Williams",
    email: "alice@example.com",
    nim: "789456123",
    attendance: "present",
    claimStatus: "claimed",
  },
  {
    id: 5,
    name: "Charlie Brown",
    email: "charlie@example.com",
    nim: "321654987",
    attendance: "absent",
    claimStatus: null,
  }
];

export default function SertifikatAdminPage() {
  const [filterValue, setFilterValue] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);


  const statusColorMap: Record<string, ChipProps["color"]> = {
    present: "success",
    absent: "danger",
    claimed: "success",
    unclaimed: "warning",
  };


  const filteredItems = React.useMemo(() => {
    return users.filter((user) =>
      user.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      user.nim.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [users, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const renderCell = React.useCallback((user: any, columnKey: React.Key) => {
    const cellValue = user[columnKey as keyof typeof user];

    switch (columnKey) {
      case "name":
        return (
          <div className="flex flex-col">
            <p className="font-bold text-small">{user.name}</p>
            <p className="text-tiny text-default-500">{user.email}</p>
          </div>
        );
      case "attendance":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[user.attendance]}
            size="sm"
            variant="flat"
          >
            {user.attendance === "present" ? "Hadir" : "Tidak Hadir"}
          </Chip>
        );
      case "claimStatus":
        if (user.attendance === "absent") {
          return (
            <Chip
              className="capitalize"
              color="default"
              size="sm"
              variant="flat"
            >
              Tidak Berlaku
            </Chip>
          );
        }
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[user.claimStatus] || "default"}
            size="sm"
            variant="flat"
          >
            {user.claimStatus === "claimed" ? "Sudah Claim" : "Belum Claim"}
          </Chip>
        );
      default:
        return cellValue;
    }
  }, []);

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-4 py-8 md:py-10">
        <div className="inline-block max-w-full text-center justify-center">
          <h1 className={title({ color: "blue" })}>Manage Sertifikat</h1>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <Input
              isClearable
              placeholder="Cari nama atau NIM..."
              className="w-full sm:max-w-[44%]"
              value={filterValue}
              onClear={() => setFilterValue("")}
              onValueChange={setFilterValue}
            />
          </div>

          <Table aria-label="Certificate claim status table">
            <TableHeader>
              <TableColumn key="name">NAMA</TableColumn>
              <TableColumn key="nim">NIM</TableColumn>
              <TableColumn key="attendance">KEHADIRAN</TableColumn>
              <TableColumn key="claimStatus">STATUS CLAIM</TableColumn>
            </TableHeader>
            <TableBody items={items}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mt-4">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={setPage}
            />
            <div className="hidden sm:flex w-[30%] justify-end gap-2">
              <label className="flex items-center text-default-400 text-small">
                Baris per halaman:
                <select
                  className="bg-transparent outline-none text-default-400 text-small"
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-default-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Keterangan Status:</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span className="text-sm">Hadir</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-danger"></div>
              <span className="text-sm">Tidak Hadir</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span className="text-sm">Sudah Claim</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span className="text-sm">Belum Claim</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-default-300"></div>
              <span className="text-sm">Tidak Berlaku</span>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}