import { Route, Routes, Navigate } from "react-router-dom";
import IndexPage from "@/pages/index";
import AboutPage from "@/pages/about";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import DashboardPage from "@/pages/dashboard";
import DetailPage from "@/pages/detail";
import ProtectedRoute from "@/components/firewall/protectedroute";
import GuestOnlyRoute from "@/components/firewall/guestonlyroute";

export default function App() {
  return (
    <Routes>
      {/* Halaman utama yang dapat diakses walaupun belum login*/}
      <Route path="/" element={<IndexPage />} />
      <Route path="/about" element={<AboutPage />} />

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

      {/* BATAS Akses untuk Tamu / Pengguna */}

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

      <Route
        path="/about"
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
