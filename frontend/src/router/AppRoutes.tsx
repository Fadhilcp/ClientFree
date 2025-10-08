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
import useAuthVerifier from "../hooks/useAuthVerifier";
import NoAuthProtectedRoute from "./NoAuthProtectedRoute";
import Loader from "../components/ui/Loader/Loader";

const AppRoutes: React.FC = () => {

    const { loading } = useAuthVerifier();
    console.log("🚀 ~ AppRoutes ~ loading:", loading)

    if(loading){
        return <Loader/>
    }

    return (

        <Routes>
            <Route element={<AppLayout />}>
            <Route path="/" element={
                <NoAuthProtectedRoute>
                    <HeroSection />
                </NoAuthProtectedRoute>
            } />
            <Route path="/roleselect" element={
                <NoAuthProtectedRoute>
                    <RoleSelect />
                </NoAuthProtectedRoute>
            } />
            <Route path="/signup" element={
                <NoAuthProtectedRoute>
                    <SignUp />
                </NoAuthProtectedRoute>
            } />
            <Route path="/login" element={
                <NoAuthProtectedRoute>
                    <Login />
                </NoAuthProtectedRoute>
            } />
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