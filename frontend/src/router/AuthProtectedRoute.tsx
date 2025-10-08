import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/ui/Loader/Loader';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

interface AuthProtectedRouteProps {
  children: React.ReactNode;
}

const AuthProtectedRoute: React.FC<AuthProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  // const token = localStorage.getItem('token');
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {

    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // const token = localStorage.getItem('token');
  if (!token) return <Loader />;

  return <>{children}</>;
};

export default AuthProtectedRoute;