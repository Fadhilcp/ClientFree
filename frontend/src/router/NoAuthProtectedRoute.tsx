import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../components/ui/Loader/Loader";
import type { RootState } from "../store/store";

interface NoAuthProtectedRouteProps {
  children: React.ReactNode;
}

const NoAuthProtectedRoute: React.FC<NoAuthProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (token) {
      navigate("/home");
    }
  }, [token, navigate]);

  if (token) return <Loader />; 

  return <>{children}</>;
};

export default NoAuthProtectedRoute;