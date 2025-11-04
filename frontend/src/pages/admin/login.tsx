import React, { useState } from "react";
import Button from "../../components/ui/Button";
import InputSection from "../../components/ui/InputSection";
import { notify } from "../../utils/toastService";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/authSlice";
import Loader from "../../components/ui/Loader/Loader";
import { validateEmail, validatePassword } from "../../utils/validators";

const AdminLogin: React.FC = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);

    const [values, setValues] = useState<{ email: string, password: string }>({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleChange = (field: keyof typeof values, value: string) => {
        setValues((prev) => ({
            ...prev,
            [field]: value
        }))
    };

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
          console.log("🚀 ~ handleSubmit ~ response.data.user:", response.data.user)
          if(response.data.user.role !== 'admin') return notify.warn('Your are not a Admin') 
            const { user, token } = response.data;
            localStorage.setItem('token',token)
            dispatch(setCredentials({user,token}))
    
            notify.success('Admin logged')
            navigate('/admin/users');
          
        } catch (error : any) {
          notify.error(error.response?.data?.error || 'Login failed')
        } finally {
          setLoading(false);
        }
      }


  return (
    <>
        { loading && <Loader/>}
        <section className="bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <h2 className="mb-6 text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                Admin Login
                </h2>

                <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6 space-y-6 sm:p-8">
                    <h1 className="text-xl font-bold text-gray-900 md:text-2xl dark:text-white">
                    Sign in to your account
                    </h1>

                    <form className="space-y-6" action="#">
                    <div>
                        <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                        Email
                        </label>
                        <InputSection<typeof values> name="email" value={values.email}
                        onChange={handleChange} error={errors.email} placeholder="Enter email"
                        className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label
                        htmlFor="password"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                        Password
                        </label>
                    
                        <InputSection<typeof values> name="password" value={values.password} type="password"
                        onChange={handleChange} error={errors.password} placeholder="Enter password"
                        className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                        />
                    </div>

                    {/* <div className="flex items-center justify-between">
                        <a
                        href="#"
                        className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-500"
                        >
                        Forgot password?
                        </a>
                    </div> */}
                    
                    <Button label="Sign in" onClick={handleSubmit}
                    className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none 
                    focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-indigo-600 
                    dark:hover:bg-indigo-700 dark:focus:ring-indigo-800"
                    />
                    
                    </form>
                </div>
                </div>
            </div>
        </section>
    </>
  );
};

export default AdminLogin;