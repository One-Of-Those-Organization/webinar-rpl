import { Route, Routes, Navigate } from "react-router-dom";
// Guest Page
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import IndexPage from "@/pages/index";

// Authorize Page
import AboutPage from "@/pages/about";
import DashboardPage from "@/pages/dashboard";
import DetailPage from "@/pages/detail";
import ProfilePage from "@/pages/profile";
import SertifikatUserPage from "@/pages/sertifikat";

// Firewall / Route
import ProtectedRoute from "@/components/firewall/protectedroute";
import GuestOnlyRoute from "@/components/firewall/guestonlyroute";

// Admin 
import DasboardAdminPage from "@/pages/admin/index";
import ManageUserPage from "@/pages/admin/manageuser";
import WebinarPage from "@/pages/admin/webinar";
import DetailAdminPage from "@/pages/admin/detail";
import SertifikatAdminPage from "@/pages/admin/serfitikat"; 
import CreateSertifikatAdminPage from "@/pages/admin/add_sertifikat";

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

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sertifikat"
        element={
          <ProtectedRoute>
            <SertifikatUserPage />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route element={<DasboardAdminPage />} path="/admin" />
      <Route element={<ManageUserPage />} path="/admin/user" />
      <Route element={<WebinarPage />} path="/admin/webinar" />
      <Route element={<DetailAdminPage />} path="/admin/detail" />
      <Route element={<WebinarPage />} path="/admin/webinar/create" />
      <Route element={<SertifikatAdminPage />} path="/admin/sertifikat" />
      <Route element={<CreateSertifikatAdminPage />} path="/admin/sertifikat/create" />

      {/* Redirect jika route tidak ditemukan */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
