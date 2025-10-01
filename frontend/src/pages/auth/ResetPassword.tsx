import React, { useState } from "react";
import InputSection from "../../components/auth/InputSection";
import PrimaryButton from "../../components/auth/PrimaryButton";
import AuthRedirectNotice from "../../components/auth/AuthRedirectNotice";
import { 
    validateConfirmPassword,
  validatePassword,
 } from "../../utils/validators";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { notify } from "../../utils/toastService";

const ResetPassword: React.FC = () => {

  const navigate = useNavigate();

  const [values, setValues] = useState<{password : string, confirmPassword : string}>({
    password : '',
    confirmPassword : '',
  });

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

  const email = sessionStorage.getItem('verifiedForgotEmail');

  const handleSubmit = async () => {

    if(!email){
        notify.error('Session expired. Please restart the forgot password flow.');
        navigate('/login')
        return;
    }

    if(!validateAll()) return;

    try {
        await authService.resetPassword(email,values.password);
        sessionStorage.removeItem('verifiedForgotEmail');
        navigate('/home');
      
    } catch (error : any) {
      notify.error(error.response?.data?.error || 'Password reset faild. Try again later')
    } 
  }




  return (
    <div className="min-h-screen bg-gray-100 text-gray-00 flex justify-center">
        <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-1">
            <div className="mt-12 flex flex-col items-center">
            <h1 className="text-indigo-600 text-2xl xl:text-3xl font-bold">Reset Your Password</h1>

            <p className="text-sm text-gray-600 text-center mt-2 mb-6">
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

export default ResetPassword;


