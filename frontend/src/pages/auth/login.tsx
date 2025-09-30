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


const Login: React.FC = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch()

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

    try {
      const response = await authService.login(values);
      console.log(response.data)
      const { user, token } = response.data;
      localStorage.setItem('token',token)
      dispatch(setCredentials({user,token}))
      navigate('/home');
      
    } catch (error : any) {
      notify.error(error.message || 'login failed');
    }
  }




  return (
    <div className="min-h-screen bg-gray-100 text-gray-00 flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-1">

          <div className="mt-12 flex flex-col items-center">

            <h1 className="text-indigo-600 text-2xl xl:text-3xl font-bold">Log in to your account.</h1>

            <div className="w-full flex-1 mt-7">
              <div className="flex flex-col items-center">


                <SocialAuthButton/>

              </div>

             <div className="my-7 px-10">
                <div className="border-b text-center">
                  <div className="leading-none px-6 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
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

                    <PrimaryButton onClick={handleSubmit}/>

                <AuthRedirectNotice/>

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

export default Login;


