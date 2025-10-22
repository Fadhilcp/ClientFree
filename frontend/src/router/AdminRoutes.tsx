import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from '../pages/admin/login'
import AdminLayout from '../layout/AdminLayout'
import Users from '../pages/admin/Users'

const AdminRoutes: React.FC = () => {
  return (
    <Routes>

        <Route element={<AdminLayout/>}>
            <Route path="/admin/login" element={<Login/>}/>
            <Route path="/admin/users" element={<Users/>}/>
        </Route>
    </Routes>
  )
}

export default AdminRoutes
