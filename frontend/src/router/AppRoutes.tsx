// router/AppRoutes.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import HeroSection from "../pages/user/landingPage/HeroSection";
import RoleSelect from "../pages/auth/roleSelect";
import SignUp from "../pages/auth/signUp";
import Login from "../pages/auth/login";
import VerifyOtp from "../pages/auth/verifyOtp";
import ResetPassword from "../pages/auth/ResetPassword";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Home from "../pages/user/Home";
import Profile from "../pages/user/profile/Profile";
import ProtectedRoute from "./ProtectedRoute";
import AuthProtectedRoute from "./AuthProtectedRoute";
// import useAuthVerifier from "../hooks/useAuthVerifier";

const AppRoutes: React.FC = () => {

    // useAuthVerifier();

    return (

        <Routes>
            <Route element={<AppLayout />}>
            <Route path="/" element={<HeroSection />} />
            <Route path="/roleselect" element={<RoleSelect />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route
                path="/verifyotp"
                element={
                <ProtectedRoute requiredEmailState={true}>
                    <VerifyOtp />
                </ProtectedRoute>
                }
            />
            <Route
                path="/reset-password"
                element={
                <ProtectedRoute requiredEmailState={true}>
                    <ResetPassword />
                </ProtectedRoute>
                }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
                path="/home"
                element={
                <AuthProtectedRoute>
                    <Home />
                </AuthProtectedRoute>
                }
            />
            <Route path="/profile" element={<Profile />} />
            </Route>
        </Routes>
    )
}

export default AppRoutes;