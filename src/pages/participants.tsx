import { SearchIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";
import { Input, Spinner, Card } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { auth_participants } from "@/api/auth_participants";
import { auth_user } from "@/api/auth_user";
import { toast } from "react-toastify";

export default function ParticipantsPage() {
  // Search, loading, pagination states, and filtered list
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredList, setFilteredList] = useState([]);

  // User email state
  const [email, setEmail] = useState("");

  // Webinar data states
  const [webinarList, setWebinarList] = useState([]);

  // Fetch user data to get current user email
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Get webinar list from API
  useEffect(() => {
    const fetchWebinars = async () => {
      if (!email) return;
      setIsLoading(true);
      try {
        const response =
          await auth_participants.event_participate_by_user(email);
        if (response.success) {
          setWebinarList(response.data || []);
          setFilteredList(response.data || []);
        } else {
          toast.error("Failed to fetch webinars.");
        }
      } catch (error) {
        toast.error("Failed to fetch webinars. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebinars();
  }, [email]);

  // Filter if search value changes or webinar list updates
  useEffect(() => {
    const q = searchValue.toLowerCase();
    setFilteredList(
      webinarList.filter(
        (w) =>
          w.name?.toLowerCase().includes(q) ||
          w.speaker?.toLowerCase().includes(q) ||
          w.description?.toLowerCase().includes(q)
      )
    );
  }, [searchValue, webinarList]);

  const handleSearchChange = useCallback((value) => {
    setSearchValue(value || "");
    setCurrentPage(1);
  }, []);

  return (
    <DefaultLayout>
      <section>
        <div>
          <h1 className="text-2xl font-bold mb-4">History Webinar</h1>
        </div>
        <div className="flex justify-between gap-3 items-end mb-6">
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
        </div>
        {/* DAFTAR WEBINAR */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner label="Loading webinars..." />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Tidak ada webinar yang diikuti.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map((webinar) => (
              <Card key={webinar.id || webinar.ID} className="p-4">
                <div className="font-bold text-lg">{webinar.name}</div>
                <div className="text-gray-600">{webinar.speaker}</div>
                <div className="text-gray-500 text-sm">{webinar.dstart}</div>
                <div className="mt-2 text-sm">{webinar.description || "-"}</div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </DefaultLayout>
  );
}
