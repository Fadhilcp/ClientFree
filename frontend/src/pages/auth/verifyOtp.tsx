import React, { useState } from 'react';
import OTPInput from '../../components/auth/OtpInput';
import AuthRedirectNotice from '../../components/auth/AuthRedirectNotice';
import { authService } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { notify } from '../../utils/toastService';
import { setCredentials } from '../../features/authSlice';
import OtpResendTimer from '../../components/auth/OtpResendTimer';
import AuthImage from '../../components/auth/AuthImage';
import type { RootState } from '../../store/store';
import Loader from '../../components/ui/Loader/Loader';
import { tokenStore } from '../../utils/tokenStore';

const VerifyOtp : React.FC = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { otpEmail, otpPurpose } = useSelector((state : RootState) => state.auth)
    const [loading, setLoading] = useState(false);

    //handleSumbit function - handling both forgot-password and signup email verification
    const handleSubmit = async (otp : string) => {
  
          if (!otpEmail || !otpPurpose) {
            notify.error('Missing email or purpose. Please restart the flow.');
            if (otpPurpose === 'signup') {
              navigate('/roleselect');
            } else {
              navigate('/login');
            }

            return; 
          }

          setLoading(true);
        try {

          //checking the purpose of otp
          if(otpPurpose === 'signup'){
            const response = await authService.verifySignupOtp(otpEmail, otp, otpPurpose);
            const { user, token } = response.data;
            
              tokenStore.set(token);
              dispatch(setCredentials({user, token, isNewUser: true}));

              notify.success('User verified')
              navigate('/home')
            }else if(otpPurpose === 'forgot-password'){

              await authService.verifyOtp(otpEmail, otp, otpPurpose);

              notify.success('OTP verfied. Please reset your password');
              navigate('/reset-password')
            }

        } catch (error : any) {
          console.log(error)
            notify.error(error.response?.data?.error || 'OTP verification failed')
        }finally{
          setLoading(false);
        }
    }


    //resend otp function
    const resendOtp = async() => {
      const email = otpEmail;
      const purpose = otpPurpose;

      if (!email || !purpose) {
        notify.error('Missing email or purpose. Please restart the flow.');

        if (purpose === 'signup') {
          navigate('/roleselect');
        } else {
          navigate('/login');
        }
        return;
      }

      setLoading(true);
      try {
        await authService.resendOtp(email, purpose);
        notify.success('OTP resent to your email');
      } catch (error : any) {
        notify.error(error.response?.data?.error || 'Failed to resend OTP');
      }finally{
        setLoading(false);
      }
    };

     

    return (
    <>
      {loading && <Loader />}
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex justify-center">
        <div className="max-w-screen-xl m-0 sm:m-10 bg-white dark:bg-gray-800 shadow sm:rounded-lg flex justify-center flex-1">
          <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-1">
            <div className="mt-12 flex flex-col items-center">
              <h1 className="text-indigo-600 dark:text-indigo-400 text-2xl xl:text-3xl font-bold">
                Verify Your Account
              </h1>

              <div className="w-full flex-1 mt-7">
                <div className="mx-auto w-full max-w-115">
                  <h2 className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                    Enter OTP
                  </h2>

                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                    An OTP has been sent to your email address. Please enter it below to verify your account.
                  </p>

                  <div className="flex justify-center mb-6">
                    <OTPInput length={6} onComplete={handleSubmit} />
                  </div>

                  <OtpResendTimer onResend={resendOtp} />

                  <AuthRedirectNotice />
                </div>
              </div>
            </div>
          </div>

          <AuthImage />
        </div>
      </div>
    </>
  );
}

export default VerifyOtp
