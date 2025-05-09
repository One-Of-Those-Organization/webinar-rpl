import { Input } from "@heroui/input";
import { button as buttonStyles } from "@heroui/theme";
import { Image } from "@heroui/react";
import { useState, useEffect } from "react";
import { CloseIcon, PlusIcon, SearchIcon } from "@/components/icons";

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

export function CreateWebinar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedPanitia, setSelectedPanitia] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInitialUsers();
    }
  }, [isOpen]);

  const fetchInitialUsers = async () => {
    setIsLoading(true);
    try {
      // Replace with actual API call
      const mockUsers = [
        { id: "1", name: "John Doe", email: "john@example.com", avatar: "https://i.pravatar.cc/150?img=1" },
        { id: "2", name: "Jane Smith", email: "jane@example.com", avatar: "https://i.pravatar.cc/150?img=2" },
        { id: "3", name: "Robert Johnson", email: "robert@example.com", avatar: "https://i.pravatar.cc/150?img=3" },
        { id: "4", name: "Emily Davis", email: "emily@example.com", avatar: "https://i.pravatar.cc/150?img=4" },
        { id: "5", name: "Michael Wilson", email: "michael@example.com", avatar: "https://i.pravatar.cc/150?img=5" },
        { id: "6", name: "Sarah Brown", email: "sarah@example.com", avatar: "https://i.pravatar.cc/150?img=6" },
        { id: "7", name: "David Taylor", email: "david@example.com", avatar: "https://i.pravatar.cc/150?img=7" },
        { id: "8", name: "Laura Martinez", email: "laura@example.com", avatar: "https://i.pravatar.cc/150?img=8" },
        { id: "9", name: "James Anderson", email: "james@example.com", avatar: "https://i.pravatar.cc/150?img=9" },
        { id: "10", name: "Jennifer Thomas", email: "jennifer@example.com", avatar: "https://i.pravatar.cc/150?img=10" },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      fetchInitialUsers();
      return;
    }

    setIsLoading(true);
    try {
      // Replace with actual search API call
      // For now, we'll just filter the mock data
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setUsers(filtered);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPanitia = (user: User) => {
    if (selectedPanitia.length < 10 && !selectedPanitia.some(p => p.id === user.id)) {
      setSelectedPanitia([...selectedPanitia, user]);
    }
  };

  const handleRemovePanitia = (id: string) => {
    setSelectedPanitia(selectedPanitia.filter(user => user.id !== id));
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className={buttonStyles()}
      >
        <PlusIcon size={20} />
        <span className="ml-2">Create Webinar</span>
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white mb-6">Create Webinar</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Webinar Details */}
                <div>
                  <Image
                    className="object-cover w-full h-48 rounded-lg mb-4"
                    alt="Preview Image Webinar"
                    src="https://heroui.com/images/hero-card-complete.jpeg"
                  />
                  
                  <div className="space-y-4">
                    <Input
                      color="secondary"
                      label="Title"
                      type="text"
                      variant="flat"
                      className="w-full"
                      required
                    />
                    <Input
                      color="secondary"
                      label="Image"
                      type="file"
                      variant="flat"
                      className="w-full"
                      required
                    />
                    <Input
                      color="secondary"
                      label="Date"
                      type="date"
                      variant="flat"
                      className="w-full"
                      required
                    />
                    <Input
                      color="secondary"
                      label="Place"
                      type="text"
                      variant="flat"
                      className="w-full"
                      required
                    />
                    <Input
                      color="secondary"
                      label="Materi"
                      type="file"
                      variant="flat"
                      className="w-full"

                    />
                    <Input
                      color="secondary"
                      label="Link"
                      type="text"
                      variant="flat"
                      className="w-full"
                    />
                    <Input
                      color="secondary"
                      label="Description"
                      type="text"
                      variant="flat"
                      className="w-full"
                    />
                  </div>
                </div>
                
                {/* Right Column - Panitia Selection */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Add Panitia (Max: 10)</h2>
                  
                  {/* Search and Select Panitia */}
                  <div className="mb-4">
                    <div className="relative">
                      <Input
                        color="secondary"
                        label="Search Users"
                        type="text"
                        variant="flat"
                        className="w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
                      />
                      <button
                        onClick={handleSearchUsers}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <SearchIcon size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* User List */}
                  <div className="border border-gray-700 rounded-lg overflow-hidden">
                    {isLoading ? (
                      <div className="p-4 text-center text-gray-400">Loading...</div>
                    ) : users.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">
                        No users found
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-700 max-h-[115mm] overflow-y-auto scrollbar-hide">
                        {users.map(user => (
                          <li key={user.id} className="p-3 hover:bg-gray-700 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <img 
                                  src={user.avatar} 
                                  alt={user.name} 
                                  className="w-10 h-10 rounded-full mr-3"
                                />
                                <div>
                                  <p className="text-white font-medium">{user.name}</p>
                                  <p className="text-gray-400 text-sm">{user.email}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleAddPanitia(user)}
                                disabled={selectedPanitia.some(p => p.id === user.id) || selectedPanitia.length >= 10}
                                className={buttonStyles({
                                  color: "primary",
                                  radius: "full",
                                  variant: "solid",
                                  size: "sm",
                                  className: "ml-2",
                                  isDisabled: selectedPanitia.some(p => p.id === user.id) || selectedPanitia.length >= 10
                                })}
                              >
                                {selectedPanitia.some(p => p.id === user.id) ? "Added" : "Add"}
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-700 pt-4">
                {/* Selected Panitia */}
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Selected Panitia:</h3>
                    {selectedPanitia.length === 0 ? (
                      <p className="text-gray-400 text-sm">No panitia selected yet</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedPanitia.map(user => (
                          <div key={user.id} className="flex items-center bg-gray-700 rounded-full px-3 py-1">
                            <img 
                              src={user.avatar} 
                              alt={user.name} 
                              className="w-6 h-6 rounded-full mr-2"
                            />
                            <span className="text-white text-sm">{user.name}</span>
                            <button 
                              onClick={() => handleRemovePanitia(user.id)}
                              className="ml-2 text-gray-300 hover:text-white"
                            >
                              <CloseIcon size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {selectedPanitia.length}/10 selected
                    </div>
                  </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setIsOpen(false)}
                  className={buttonStyles({
                    color: "danger",
                    radius: "full",
                    variant: "solid",
                    size: "md",
                  })}
                >
                  Cancel
                </button>
                <button
                  className={buttonStyles({
                    color: "primary",
                    radius: "full",
                    variant: "solid",
                    size: "md",
                  })}
                >
                  Create Webinar
                </button>
              </div>
            </div>
            </div>
        </div> 
      )}
    </>
  );
}
