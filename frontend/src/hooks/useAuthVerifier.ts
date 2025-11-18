import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { setCredentials, logout } from "../features/authSlice";
import { tokenStore } from "../utils/tokenStore";
import { notify } from "../utils/toastService";

const useAuthVerifier = () => {
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {

    const existingToken = tokenStore.get();
    if(existingToken) {
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
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
        console.log(error);
        await authService.logout();
        dispatch(logout());
        tokenStore.clear();
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [dispatch, navigate]);

  return { loading }
};

export default useAuthVerifier;