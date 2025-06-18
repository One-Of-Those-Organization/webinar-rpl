import { Route, Routes, Navigate } from "react-router-dom";
// Guest Page
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import IndexPage from "@/pages/index";
import LupaPassword from "@/pages/auth/lupa_password";
import LupaPasswordOTP from "@/pages/auth/otp_lupa_password";
import AboutPage from "@/pages/about";
import InputOTP from "@/pages/auth/input_otp";

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
import CreateWebinar from "@/pages/admin/add_webinar";
import EditWebinarPage from "@/pages/admin/edit_webinar";
import SertifikatAdminPage from "@/pages/admin/serfitikat";
import CreateSertifikatAdminPage from "@/pages/admin/add_sertifikat";
import EditAdminPage from "@/pages/admin/edit_user";
import AddUserPage from "@/pages/admin/add_user";

export default function App() {
  return (
    <Routes>
      {/* Halaman utama yang dapat diakses walaupun belum login*/}
      <Route path="/" element={<IndexPage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* Guest Only Routes */}
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
        path="/input_otp"
        element={
          <GuestOnlyRoute>
            <InputOTP />
          </GuestOnlyRoute>
        }
      />

      {/* BATAS Akses untuk Tamu / Pengguna */}

      {/* Protected Routes - User Only */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/detail/:id"
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

      {/* BATAS Akses untuk User / Admin */}

      {/* ==================== ADMIN ROUTES ==================== */}

      {/* Dashboard Admin */}
      <Route
        path="/admin"
        element={
          <AdminOnlyRoute requireAdmin={true}>
            <DasboardAdminPage />
          </AdminOnlyRoute>
        }
      />

      {/* =============== USER MANAGEMENT =============== */}
      {/* View All Users Admin */}
      <Route
        path="/admin/user"
        element={
          <AdminOnlyRoute requireAdmin={true}>
            <ManageUserPage />
          </AdminOnlyRoute>
        }
      />

      {/* Add New User Admin*/}
      <Route
        path="/admin/user/add"
        element={
          <AdminOnlyRoute requireAdmin={true}>
            <AddUserPage />
          </AdminOnlyRoute>
        }
      />

      {/* Edit User Admin */}
      <Route
        path="/admin/user/edit/:email"
        element={
          <AdminOnlyRoute requireAdmin={true}>
            <EditAdminPage />
          </AdminOnlyRoute>
        }
      />

      {/* =============== WEBINAR MANAGEMENT =============== */}
      {/* View All Webinars */}
      <Route
        path="/admin/webinar"
        element={
          <AdminOnlyRoute requireAdmin={true}>
            <WebinarPage />
          </AdminOnlyRoute>
        }
      />

      {/* Add New Webinar */}
      <Route
        path="/admin/webinar/add"
        element={
          <AdminOnlyRoute requireAdmin={true}>
            <CreateWebinar />
          </AdminOnlyRoute>
        }
      />

      {/* Edit Webinar */}
      <Route
        path="/admin/webinar/edit/:id"
        element={
          <AdminOnlyRoute requireAdmin={true}>
            <EditWebinarPage />
          </AdminOnlyRoute>
        }
      />

      {/* =============== SERTIFIKAT MANAGEMENT =============== */}
      {/* View All Sertifikat */}
      <Route
        path="/admin/sertifikat"
        element={
          <AdminOnlyRoute requireAdmin={true}>
            <SertifikatAdminPage />
          </AdminOnlyRoute>
        }
      />

      {/* Create New Sertifikat */}
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
