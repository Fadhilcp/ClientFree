import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { setCredentials, logout } from "../features/authSlice";
import { tokenStore } from "../utils/tokenStore";
import { notify } from "../utils/toastService";

const PUBLIC_PATHS = [
  "/", "/signup", "/login", "/forgot-password",
  "/verifyotp", "/reset-password", "/roleselect",
  "/admin/login"
];

const useAuthVerifier = () => {
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const pathname = location.pathname;
  console.log("🚀 ~ useAuthVerifier ~ pathname:", pathname)
  
  useEffect(() => {

    if(PUBLIC_PATHS.includes(pathname)) {
      setLoading(false);
      return;
    }

    const existingToken = tokenStore.get();
    if(existingToken) {
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        console.log("🚀 ~ verify ~ response:")
        const response = await authService.accessToken();

        if (response.data?.success) {
          const { user, token } = response.data;

          if(user.status === 'banned'){
            notify.warn('You are banned');
            await authService.logout();
            tokenStore.clear();
            dispatch(logout());
            navigate('/');
            return;
          }

          tokenStore.set(token);
          dispatch(setCredentials({ user, token }));
        } else {
          await authService.logout();
          dispatch(logout());
          tokenStore.clear();
          navigate("/login");
        }
      } catch (error: any) {
        await authService.logout();
        dispatch(logout());
        tokenStore.clear();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [dispatch, navigate, pathname]);

  return { loading }
};

export default useAuthVerifier;