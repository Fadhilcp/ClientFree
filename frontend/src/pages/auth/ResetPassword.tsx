import React, { useState } from "react";
import InputSection from "../../components/ui/InputSection";
import PrimaryButton from "../../components/auth/PrimaryButton";
import AuthRedirectNotice from "../../components/auth/AuthRedirectNotice";
import { 
    validateConfirmPassword,
  validatePassword,
 } from "../../utils/validators/profileForm";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { notify } from "../../utils/toastService";
import AuthImage from "../../components/auth/AuthImage";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import Loader from "../../components/ui/Loader/Loader";

const ResetPassword: React.FC = () => {
    
    const navigate = useNavigate();


    const email = useSelector((state : RootState) => state.auth.otpEmail)
    
    const [values, setValues] = useState<{password : string, confirmPassword : string}>({
        password : '',
        confirmPassword : '',
    });

    const [loading, setLoading] = useState(false);

    //using Record utility to create object<key, value>
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleChange = (field : keyof typeof values, value : string) => {
        setValues((prev) => ({
        ...prev,
        [field] : value
        }))
    }

    const validateAll = () => {
        const newErrors : Record<string, string> = {
        password : validatePassword(values.password),
        confirmPassword : validateConfirmPassword(values.password,values.confirmPassword),
        }

        setErrors(newErrors);
        return Object.values(newErrors).every((msg) => msg === '')
    }


    const handleSubmit = async () => {

        if(!email){
            notify.error('Please restart the forgot password flow.');
            navigate('/login')
            return;
        }

        if(!validateAll()) return;

        setLoading(true);
        try {
            await authService.resetPassword(email,values.password);
            navigate('/login');
        
        } catch (error : any) {
            notify.error(error.response?.data?.error || 'Password reset failed. Try again later')
        } finally {
            setLoading(false);
        }
    }




    return (
    <>
        {loading && <Loader />}
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex justify-center">
        <div className="max-w-screen-xl m-0 sm:m-10 bg-white dark:bg-gray-800 shadow sm:rounded-lg flex justify-center flex-1">
            <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-1">
            <div className="mt-12 flex flex-col items-center">
                <h1 className="text-indigo-600 dark:text-indigo-400 text-2xl xl:text-3xl font-bold">
                Reset Your Password
                </h1>

                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2 mb-6">
                Set a new password for your account to regain access.
                </p>

                <div className="w-full flex-1 mt-4">
                <div className="mx-auto w-full max-w-115">
                    <InputSection<typeof values>
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    placeholder="New password"
                    error={errors.password}
                    />

                    <InputSection<typeof values>
                    name="confirmPassword"
                    type="password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    error={errors.confirmPassword}
                    />

                    <PrimaryButton onClick={handleSubmit} children="Reset Password" />

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

export default ResetPassword;


