import { Routes, Route } from "react-router-dom";
import NotFoundPage from "../pages/user/NotFoundPage";
import { lazy } from "react";
import useAuthVerifier from "../hooks/useAuthVerifier";
import Loader from "../components/ui/Loader/Loader";

const UserRoutes = lazy(() => import("./UserRoutes"));
const AdminRoutes = lazy(() => import("./AdminRoutes"));

const AppRoutes = () => {

    const { loading } = useAuthVerifier();

    if(loading) return <Loader/>
    return (
        <Routes>
            {/* Admin routes */}
            <Route path="/admin/*" element={<AdminRoutes />} />
            
            {/* User routes */}
            <Route path="/*" element={<UserRoutes />} />

            {/* Global fallback */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default AppRoutes;