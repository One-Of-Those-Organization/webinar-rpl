import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth_user } from "@/api/auth_user";
import { UserData } from "@/api/interface";

interface ProtectedRouteProps extends React.PropsWithChildren {
  requireAdmin?: boolean;
}

const AdminOnlyRoute = ({
  children,
  requireAdmin = true,
}: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await auth_user.get_current_user();

        if (response.success && response.data) {
          const userData = response.data as UserData;

          if (requireAdmin && userData.UserRole !== 1) {
            navigate("/");
          } else {
            setIsAuthorized(true);
          }
        } else {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, requireAdmin]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
};

export default AdminOnlyRoute;
