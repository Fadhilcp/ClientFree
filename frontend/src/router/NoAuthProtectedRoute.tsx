import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../components/ui/Loader/Loader";
import type { RootState } from "../store/store";

interface NoAuthProtectedRouteProps {
  children: React.ReactNode;
}

const NoAuthProtectedRoute: React.FC<NoAuthProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (token && user) {
      if (user.role === "admin") {
        navigate("/admin/users", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    } else {
      setLoading(false);
    }
  }, [token, user, navigate]);

  if (loading) return <Loader />;

  return <>{children}</>;
};

export default NoAuthProtectedRoute;