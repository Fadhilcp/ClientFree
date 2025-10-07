import React, { useState } from "react";
import InputSection from "../../components/auth/InputSection";
import PrimaryButton from "../../components/auth/PrimaryButton";
import SocialAuthButton from "../../components/auth/SocialAuthButton";
import AuthRedirectNotice from "../../components/auth/AuthRedirectNotice";
import { 
  validateEmail,
  validatePassword,
 } from "../../utils/validators";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { notify } from "../../utils/toastService";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/authSlice";
import AuthImage from "../../components/auth/AuthImage";
import Loader from "../../components/ui/Loader/Loader";

const Login: React.FC = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState<{email : string, password : string}>({
    email : '',
    password : '',
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
      email : validateEmail(values.email),
      password : validatePassword(values.password)
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((msg) => msg === '')
  }



  const handleSubmit = async () => {
    if(!validateAll()) return;

    setLoading(true);
    try {
      const response = await authService.login(values);
        const { user, token } = response.data;
        localStorage.setItem('token',token)
        dispatch(setCredentials({user,token}))

        notify.success('User logged')
        navigate('/home');
      
    } catch (error : any) {
      notify.error(error.response?.data?.error || 'Login failed')
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
                Log in to your account.
              </h1>

              <div className="w-full flex-1 mt-7">
                <div className="flex flex-col items-center">
                  <SocialAuthButton />
                </div>

                <div className="my-7 px-10">
                  <div className="border-b border-gray-300 dark:border-gray-600 text-center">
                    <div className="leading-none px-6 inline-block text-sm text-gray-600 dark:text-gray-400 tracking-wide font-medium bg-white dark:bg-gray-800 transform translate-y-1/2">
                      Or
                    </div>
                  </div>
                </div>

                <div className="mx-auto w-full max-w-115">
                  <InputSection<typeof values>
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    error={errors.email}
                  />

                  <InputSection<typeof values>
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    error={errors.password}
                  />

                  <div className="text-right mt-2 mb-4">
                    <a
                      href="/forgot-password"
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      Forgot Password?
                    </a>
                  </div>

                  <PrimaryButton onClick={handleSubmit} children="Login" />

                  <AuthRedirectNotice
                    message="Don't you have an account?"
                    linkText="Sign Up"
                    linkTo="/roleselect"
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

export default Login;


