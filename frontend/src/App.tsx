import React from "react"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

import SignUp from "./pages/auth/signUp";
import RoleSelect from "./pages/auth/roleSelect";
import VerifyOtp from "./pages/auth/verifyOtp";
import Login from "./pages/auth/login";
import ResetPassword from "./pages/auth/ResetPassword";

import { Provider } from "react-redux";
import { store } from "./store/store";
import { Routes, Route } from "react-router-dom";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from "./pages/user/profile/Profile";
import Home from "./pages/user/Home";

const App: React.FC = () => {
  return (
    <div>
      <Provider store={store}>


          <Routes>

            <Route path="/roleselect" element={<RoleSelect/>}/>
            <Route path="/signup" element={<SignUp/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/verifyotp" element={<VerifyOtp/>}/>
            <Route path="/reset-password" element={<ResetPassword/>}/>
            <Route path="/forgot-password" element={<ForgotPassword/>}/>

            <Route path="/home" element={<Home/>}/>


            <Route path="/profile" element={<Profile/>}/>

          </Routes>
            <ToastContainer position="top-right" autoClose={3000} theme="colored"/>


      </Provider>
      
    </div>
  )
}

export default App
