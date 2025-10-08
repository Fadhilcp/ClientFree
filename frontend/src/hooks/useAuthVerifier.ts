import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { setCredentials, logout } from "../features/authSlice";

const useAuthVerifier = () => {
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log('there is no token in the localstorage')
      setLoading(false);
      return;
    }

    const verify = async () => {
      console.log('from verify function');
      
      try {
        const response = await authService.verifyUser();
        console.log("🚀 ~ verify ~ response:", response.data)
        if (response.data?.success) {
          const { user, token } = response.data;
          dispatch(setCredentials({ user, token }));
          localStorage.setItem("token", token);
        } else {
          dispatch(logout());
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Token verification failed", error);
        dispatch(logout());
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [dispatch, navigate]);

  return { loading }
};

export default useAuthVerifier;