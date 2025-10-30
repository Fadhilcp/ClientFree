import React, { useState, useEffect } from "react";
import InputSection from "../../components/ui/InputSection";
import PrimaryButton from "../../components/auth/PrimaryButton";
import AuthRedirectNotice from "../../components/auth/AuthRedirectNotice";
import { 
  validateEmail,
 } from "../../utils/validators";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { notify } from "../../utils/toastService";
import AuthImage from "../../components/auth/AuthImage";
import { useDispatch } from "react-redux";
import { setOtpInfo } from "../../features/authSlice";
import Loader from "../../components/ui/Loader/Loader";

const ForgotPassword : React.FC = () => {

    const dispatch = useDispatch();

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
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
        setLoading(true);
        try {
        await authService.forgotPassword(email);

        dispatch(setOtpInfo({ email, purpose: 'forgot-password'}))

        notify.success('OTP sent to your email');
        navigate('/verifyOtp');
        } catch (err: any) {
        notify.error(err.response?.data?.error || 'Failed to send OTP');
        } finally {
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
                Forgot Your Password
                </h1>

                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2 mb-6">
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

            <AuthImage />
        </div>
        </div>
    </>
    );
};

export default ForgotPassword;