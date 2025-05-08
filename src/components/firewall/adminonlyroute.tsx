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
    const user_data = localStorage.getItem("user_data");
    let admin: number = 0;
    if (!user_data) {
      navigate("/");
    } else {
      admin = JSON.parse(user_data).UserRole;
    }

    if (!token) {
      navigate("/login");
      return;
    }

    if (requireAdmin && admin !== 1) {
      navigate("/");
    }
  }, [navigate, requireAdmin]);

  return <>{children}</>;
};

export default AdminOnlyRoute;
