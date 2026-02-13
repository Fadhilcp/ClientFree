import { Routes, Route } from "react-router-dom";
import NotFoundPage from "../pages/user/NotFoundPage";
import { lazy } from "react";

const UserRoutes = lazy(() => import("./UserRoutes"));
const AdminRoutes = lazy(() => import("./AdminRoutes"));

const AppRoutes = () => {
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