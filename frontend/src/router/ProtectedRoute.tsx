import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import Loader from '../components/ui/Loader/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredEmailState?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredEmailState }) => {
  const navigate = useNavigate();
  const { otpEmail, otpPurpose } = useSelector((state: RootState) => state.auth);

  useEffect(() => {

    if (requiredEmailState && (!otpEmail || !otpPurpose)) {
      navigate('/login');
    }
  }, [otpEmail, otpPurpose, navigate, requiredEmailState]);


  if (requiredEmailState && (!otpEmail || !otpPurpose)) return <Loader/>;

  return <>{children}</>;
};

export default ProtectedRoute;