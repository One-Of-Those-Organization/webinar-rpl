import { Route, Routes } from "react-router-dom";
import IndexPage from "@/pages/index";
import AboutPage from "@/pages/about";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import DashboardPage from "@/pages/dashboard";
import DetailPage from "@/pages/detail";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<AboutPage />} path="/about" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RegisterPage />} path="/register" />
      <Route element={<DashboardPage />} path="/dashboard" />
      <Route element={<DetailPage />} path="/detail" />
    </Routes>
  );
}

export default App;

