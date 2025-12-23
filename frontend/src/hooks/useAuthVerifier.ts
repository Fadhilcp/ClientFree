import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { authService } from "../services/auth.service";
import { setCredentials, logout } from "../features/authSlice";
import { tokenStore } from "../utils/tokenStore";

// const PUBLIC_PATHS = [
//   "/", "/signup", "/login", "/forgot-password",
//   "/verifyotp", "/reset-password", "/roleselect",
//   "/admin/login"
// ];

// const PUBLIC_PATHS = [
//   "/forgot-password",
//   "/verifyotp",
//   "/reset-password",
//   "/admin/login"
// ];

const useAuthVerifier = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await authService.accessToken();

        if (response.data?.success) {
          const { user, token } = response.data;
          dispatch(setCredentials({ user, token }));
          tokenStore.set(token)
        } else {
          dispatch(logout());
        }
      } catch {
        dispatch(logout());
        tokenStore.clear();
      } finally {
        setLoading(false);
      }
    };


    verify();
  }, [dispatch]);

  return { loading };
};


export default useAuthVerifier;