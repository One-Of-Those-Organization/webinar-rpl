import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Component to restrict access to certain routes for unauthenticated users

const ProtectedRoute = ({ children }: React.PropsWithChildren) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return <>{children}</>;
};

export default ProtectedRoute;
