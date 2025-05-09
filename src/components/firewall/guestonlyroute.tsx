import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Component to restrict access to certain routes for authenticated users

const GuestOnlyRoute = ({ children }: React.PropsWithChildren) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  return children;
};

export default GuestOnlyRoute;
