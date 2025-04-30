import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }: React.PropsWithChildren) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("session_id");
    console.log(token);
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return <>{children}</>;
};

export default ProtectedRoute;
