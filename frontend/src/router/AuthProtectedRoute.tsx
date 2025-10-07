import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/ui/Loader/Loader';

interface AuthProtectedRouteProps {
  children: React.ReactNode;
}

const AuthProtectedRoute: React.FC<AuthProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const token = localStorage.getItem('token');
  if (!token) return <Loader />;

  return <>{children}</>;
};

export default AuthProtectedRoute;