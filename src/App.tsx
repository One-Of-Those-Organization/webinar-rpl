import { Route, Routes, Navigate } from "react-router-dom";
// Guest Page
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import IndexPage from "@/pages/index";
import LupaPassword from "@/pages/auth/lupa_password";
import LupaPasswordOTP from "@/pages/auth/otp_lupa_password";
import AboutPage from "@/pages/about";

// Authorize Page
import DashboardPage from "@/pages/dashboard";
import DetailPage from "@/pages/detail";
import ProfilePage from "@/pages/profile";
import SertifikatUserPage from "@/pages/sertifikat";

// Firewall / Route
import ProtectedRoute from "@/components/firewall/protectedroute";
import GuestOnlyRoute from "@/components/firewall/guestonlyroute";
import AdminOnlyRoute from "@/components/firewall/adminonlyroute";

// Admin
import DasboardAdminPage from "@/pages/admin/index";
import ManageUserPage from "@/pages/admin/manageuser";
import WebinarPage from "@/pages/admin/webinar";
import DetailAdminPage from "@/pages/admin/detail";
import SertifikatAdminPage from "@/pages/admin/serfitikat";
import CreateSertifikatAdminPage from "@/pages/admin/add_sertifikat";
import EditAdminPage from "@/pages/admin/edit_user";

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

      <Route
        path="/lupa_password"
        element={
          <GuestOnlyRoute>
            <LupaPassword />
          </GuestOnlyRoute>
        }
      />

      <Route
        path="/otp_lupa_password"
        element={
          <GuestOnlyRoute>
            <LupaPasswordOTP />
          </GuestOnlyRoute>
        }
      />

      <Route
        path="/about"
        element={
          <GuestOnlyRoute>
            <DetailPage />
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

      {/* Hanya untuk admin */}
      {/* Dashboard Admin */}
      <Route
        path="/admin"
        element={
          <AdminOnlyRoute requireAdmin={true}>
            <DasboardAdminPage />
          </AdminOnlyRoute>
        }
      />

      {/* View User Admin*/}
      <Route
        path="/admin/user"
        element={
          <AdminOnlyRoute requireAdmin={true}>
            <ManageUserPage />
          </AdminOnlyRoute>
        }
      />

      {/* Editing User Admin*/}
      <Route
        path="/admin/user/edit"
        element={
          <AdminOnlyRoute requireAdmin={true}>
            <EditAdminPage />
          </AdminOnlyRoute>
        }
      />

      {/* View Webinar Admin*/}
      <Route
        path="/admin/webinar"
        element={
          <AdminOnlyRoute requireAdmin={true}>
            <WebinarPage />
          </AdminOnlyRoute>
        }
      />

      {/* Detail Webinar Admin*/}
      <Route
        path="/admin/webinar/detail"
        element={
          <AdminOnlyRoute requireAdmin={true}>
            <DetailAdminPage />
          </AdminOnlyRoute>
        }
      />

      {/* Sertifikat Admin */}
      <Route
        path="/admin/sertifikat"
        element={
          <AdminOnlyRoute requireAdmin={true}>
            <SertifikatAdminPage />
          </AdminOnlyRoute>
        }
      />

      {/* Create Sertifikat Admin */}
      <Route
        path="/admin/sertifikat/create"
        element={
          <AdminOnlyRoute requireAdmin={true}>
            <CreateSertifikatAdminPage />
          </AdminOnlyRoute>
        }
      />

      {/* Redirect jika route tidak ditemukan */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
