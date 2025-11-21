import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "../layout/user/UserLayout";
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
import Subscriptions from "../pages/user/Subscriptions";
import SettingsLayout from "../layout/user/SettingsLayout";
import SecuritySetting from "../pages/user/settings/SecuritySetting";
import JobLayout from "../layout/user/JobLayout";
import JobsPage from "../pages/user/job/JobsPage";
import DummyWrapper from "../pages/user/job/JobDetail";


const UserRoutes: React.FC = () => {

    const { loading } = useAuthVerifier();

    if(loading){
        return <Loader/>
    }

    return (

        <Routes>
        
            <Route element={<UserLayout />}>
            {/* public routes - start */}
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
            {/* public routes - end */}
            {/* Authenticated user routes - start */}
            <Route
                path="/home"
                element={
                <AuthProtectedRoute allowedRoles={['client','freelancer']}>
                    <Home />
                </AuthProtectedRoute>
                }
            />
            <Route
                path="/premium" element={
                <AuthProtectedRoute allowedRoles={['client','freelancer']}>
                    <Subscriptions />
                </AuthProtectedRoute>
                }
            />
            <Route path="/profile" element={
                <AuthProtectedRoute allowedRoles={['client','freelancer']}>
                    <Profile />
                </AuthProtectedRoute>} />
            {/* Authenticated user routes - end */}

            {/* Job routes under user layout - start */}
            <Route path="/my-jobs" element={
                <AuthProtectedRoute allowedRoles={['client','freelancer']}>
                    <JobLayout/>
                </AuthProtectedRoute>
            }>
                <Route index element={<Navigate to="active-jobs" replace />} />
                <Route path="active-jobs" element={<JobsPage status="active" title="Active Jobs" />}/>
                <Route path="posted-jobs" element={<JobsPage status="open" title="Posted Jobs" />}/>
                <Route path="completed-jobs" element={<JobsPage status="completed" title="Completed Jobs" />}/>
            </Route>
            <Route
                path="/my-jobs/job-details" element={
                <AuthProtectedRoute allowedRoles={['client','freelancer']}>
                    <DummyWrapper/>
                </AuthProtectedRoute>
                }
            />
            {/* Job routes under user layout - end */}
            {/* Setting routes under user layout - start */}
            <Route path="/settings" element={
                <AuthProtectedRoute allowedRoles={['client','freelancer']}>
                    <SettingsLayout/>
                </AuthProtectedRoute>
            }>
                <Route index element={<Navigate to="account-security" replace />} />
                <Route path="account-security" element={<SecuritySetting/>}/>
            </Route>
            {/* Setting routes under user layout - end */}
            </Route>
        </Routes>
    )
}

export default UserRoutes;