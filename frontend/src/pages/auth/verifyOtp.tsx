import React from 'react';
import OTPInput from '../../components/auth/OtpInput';
import AuthRedirectNotice from '../../components/auth/AuthRedirectNotice';
import { authService } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { notify } from '../../utils/toastService';
import { setCredentials } from '../../features/authSlice';

const VerifyOtp : React.FC = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    
    const handleSubmit = async (otp : string) => {
      const email = sessionStorage.getItem('signUpEmail');
  
          if(!email){
              notify.error('Email not found. Please restart signup')
              navigate('/roleselect');
              return;
          }

        try {
            const response = await authService.verifyOtp(email, otp);

            const { user, token } = response.data;

            localStorage.setItem('token',token);
            dispatch(setCredentials({user, token}));
            sessionStorage.removeItem('signUpEmail');

            navigate('/home')
        } catch (error : any) {
            notify.error(error.response?.data?.message || 'OTP verification failed')
        }
    }


  return (
    <div className="min-h-screen bg-gray-100 text-gray-00 flex justify-center">
  <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
    <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-1">
      <div className="mt-12 flex flex-col items-center">
        <h1 className="text-indigo-600 text-2xl xl:text-3xl font-bold">Verify Your Account</h1>

        <div className="w-full flex-1 mt-7">
          <div className="mx-auto w-full max-w-115">
            <h2 className="text-center text-lg font-semibold text-gray-700 mb-4">
              Enter OTP
            </h2>

            <p className="text-sm text-gray-600 text-center mb-6">
              An OTP has been sent to your email address. Please enter it below to verify your account.
            </p>

            <div className="flex justify-center mb-6">
              <OTPInput length={6} onComplete={handleSubmit} />
            </div>

            <AuthRedirectNotice />
          </div>
        </div>
      </div>
    </div>

    <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
      <div
        className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')",
        }}
      />
    </div>
  </div>
</div>
  )
}

export default VerifyOtp
