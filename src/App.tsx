import { Route, Routes, Navigate } from "react-router-dom";
import IndexPage from "@/pages/index";
import AboutPage from "@/pages/about";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import DashboardPage from "@/pages/dashboard";
import DetailPage from "@/pages/detail";
import ProtectedRoute from "@/components/protectedroute";
import GuestOnlyRoute from "@/components/guestonlyroute";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<IndexPage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* Hanya untuk tamu (belum login) */}
      <Route
        path="/login"
        element={
          <GuestOnlyRoute>
            <LoginPage />
          </GuestOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnlyRoute>
            <RegisterPage />
          </GuestOnlyRoute>
        }
      />

      {/* Hanya untuk user login */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/detail"
        element={
          <ProtectedRoute>
            <DetailPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect jika route tidak ditemukan */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
