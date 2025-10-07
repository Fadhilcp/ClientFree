import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { setCredentials, logout } from "../features/authSlice";

const useAuthVerifier = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const verify = async () => {
      try {
        const response = await authService.verifyUser();
        console.log("🚀 ~ verify ~ response:", response)
        if (response.data?.success) {
          const { user, token } = response.data;
          dispatch(setCredentials({ user, token }));
          localStorage.setItem("token", token);
        }
      } catch (error) {
        console.error("Token verification failed", error);
        dispatch(logout());
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    verify();
  }, [dispatch, navigate]);
};

export default useAuthVerifier;