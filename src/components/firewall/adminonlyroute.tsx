import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps extends React.PropsWithChildren {
  requireAdmin?: boolean;
}

const AdminOnlyRoute = ({
  children,
  requireAdmin = true,
}: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const admin = localStorage.getItem("admin");
    console.log("token", token);
    console.log("admin", admin);

    if (!token) {
      navigate("/login");
      return;
    }

    if (requireAdmin && admin !== "1") {
      navigate("/");
    }
  }, [navigate, requireAdmin]);

  return <>{children}</>;
};

export default AdminOnlyRoute;
