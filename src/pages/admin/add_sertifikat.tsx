import { useState } from "react";
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
  Button,
  Input,
  Checkbox,
  Card,
  CardBody,
  Image,
  Divider
} from "@heroui/react";
import Upload from "@/components/upload";

const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    nim: "123456789",
    registered: true,
    selected: false
  },

];

export default function CreateSertifikatAdminPage() {
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userList, setUserList] = useState(users);
  const [filterValue, setFilterValue] = useState("");
  const [selectedCount, setSelectedCount] = useState(0);

  const handleFileUpload = (file: File) => {
    setTemplateFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const toggleUserSelection = (userId: number) => {
    setUserList(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, selected: !user.selected } : user
      )
    );
    setSelectedCount(prev => 
      userList.find(u => u.id === userId)?.selected ? prev - 1 : prev + 1
    );
  };

  const filteredItems = userList.filter(user =>
    user.name.toLowerCase().includes(filterValue.toLowerCase()) ||
    user.nim.toLowerCase().includes(filterValue.toLowerCase())
  );

  const generateCertificates = () => {
    if (!templateFile) {
      alert("Please upload a template first");
      return;
    }
    if (selectedCount === 0) {
      alert("Please select at least one user");
      return;
    }
    
    const selectedUsers = userList.filter(user => user.selected);
    console.log("Generating certificates for:", selectedUsers);
    alert(`Generating ${selectedCount} certificates...`);
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 py-8 md:py-10">
        <div className="inline-block max-w-full text-center justify-center">
          <h1 className={title({ color: "blue" })}>Buat Sertifikat</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <CardBody className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Upload Template Sertifikat</h2>
              <Upload 
                accept="image/*,.pdf" 
                onFileUpload={handleFileUpload}
              />
              
              {previewUrl && (
                <div className="mt-4">
                  <h3 className="text-md font-medium mb-2">Preview Template:</h3>
                  <Image
                    alt="Template preview"
                    className="w-full h-auto max-h-60 object-contain border rounded"
                    src={previewUrl}
                  />
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardBody className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Ringkasan</h2>
              <div className="space-y-2">
                <p>Template: {templateFile ? templateFile.name : "Belum diupload"}</p>
                <p>Peserta terpilih: {selectedCount}</p>
                <Divider />
                <Button 
                  color="primary" 
                  fullWidth
                  onClick={generateCertificates}
                  isDisabled={!templateFile || selectedCount === 0}
                >
                  Generate Sertifikat ({selectedCount})
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="p-4">
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <Input
                isClearable
                placeholder="Cari nama atau NIM..."
                className="w-full sm:max-w-[50%]"
                value={filterValue}
                onClear={() => setFilterValue("")}
                onValueChange={setFilterValue}
              />
            </div>

            <Table aria-label="User selection table">
              <TableHeader>
                <TableColumn width={50}>Pilih</TableColumn>
                <TableColumn>NAMA</TableColumn>
                <TableColumn>NIM</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredItems.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox 
                        isSelected={user.selected}
                        onChange={() => toggleUserSelection(user.id)}
                        isDisabled={!user.registered}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <p className="font-bold text-small">{user.name}</p>
                        <p className="text-tiny text-default-500">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{user.nim}</TableCell>
                    <TableCell>
                      <Chip
                        color={user.registered ? "success" : "danger"}
                        size="sm"
                        variant="flat"
                      >
                        {user.registered ? "Terdaftar" : "Belum Terdaftar"}
                      </Chip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </section>
    </DefaultLayout>
  );
}