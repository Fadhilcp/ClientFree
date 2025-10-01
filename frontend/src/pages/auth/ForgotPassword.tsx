import React, { useState, useEffect } from "react";
import InputSection from "../../components/auth/InputSection";
import PrimaryButton from "../../components/auth/PrimaryButton";
import AuthRedirectNotice from "../../components/auth/AuthRedirectNotice";
import { 
  validateEmail,
 } from "../../utils/validators";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { notify } from "../../utils/toastService";

const ForgotPassword : React.FC = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleEmail = (value : string) => {
        setEmail(value)
    }

    //to apply delay for the error 
    useEffect(() => {
        const timeout = setTimeout(() => {
            setError(validateEmail(email));
        }, 300);

        return () => clearTimeout(timeout);
    }, [email]);


    const handleSubmit = async () => {
        
        const checkEmail = validateEmail(email);

        if(checkEmail){
            setError(checkEmail)
            return;
        }

        try {
        await authService.forgotPassword(email); 
        sessionStorage.setItem('forgotEmail', email);
        sessionStorage.setItem('otpPurpose', 'forgot-password');
        notify.success('OTP sent to your email');
        navigate('/verifyOtp');
        } catch (err: any) {
        notify.error(err.response?.data?.error || 'Failed to send OTP');
        }
    };





  return (
    <div className="min-h-screen bg-gray-100 text-gray-00 flex justify-center">
        <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-1">
            <div className="mt-12 flex flex-col items-center">
            <h1 className="text-indigo-600 text-2xl xl:text-3xl font-bold">Forgot Your Password</h1>

            <p className="text-sm text-gray-600 text-center mt-2 mb-6">
                Enter your registered email to receive a verification code.
            </p>

            <div className="w-full flex-1 mt-4">
                <div className="mx-auto w-full max-w-115">
                <InputSection
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleEmail}
                    placeholder="Enter your email"
                    error={error}
                />


                <PrimaryButton onClick={handleSubmit} children="Send OTP" />

                <AuthRedirectNotice
                    message="Remembered your password?"
                    linkText="Log In"
                    linkTo="/login"
                />
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
    );
};

export default ForgotPassword;



