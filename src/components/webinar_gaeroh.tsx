// Extract time from datetime string
export const extractTime = (dateTimeStr: string): string => {
  if (!dateTimeStr) return "";
  try {
    const date = new Date(dateTimeStr);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch (e) {
    return "";
  }
};

// Extract date from datetime string
export const extractDate = (dateTimeStr: string): string => {
  if (!dateTimeStr) return "";
  try {
    const date = new Date(dateTimeStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (e) {
    return "";
  }
};

// Format date for display in UI
export const formatDateDisplay = (dateStr: string | undefined) => {
  if (!dateStr) return "Date not available";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return dateStr;
  }
};

// Combine date and time into ISO string
export const combineDateAndTime = (date: string, time: string): string => {
  return new Date(`${date}T${time}:00`).toISOString();
};

// Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
export const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
