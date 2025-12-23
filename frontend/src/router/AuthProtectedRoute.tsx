import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/ui/Loader/Loader";
import type { RootState } from "../store/store";

type UserRole = "freelancer" | "client" | "admin";

interface AuthProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const AuthProtectedRoute: React.FC<AuthProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const { token, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token === undefined || user === undefined) return;

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (allowedRoles?.length && user && !allowedRoles.includes(user.role)) {
      navigate(user.role === "admin" ? "/admin/users" : "/home");
      return;
    }

    setLoading(false);
  }, [token, user, allowedRoles, navigate]);

  if (loading) return <Loader />;

  return <>{children}</>;
};

export default AuthProtectedRoute;