import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from '../pages/admin/login'
import AdminLayout from '../layout/AdminLayout'
import Users from '../pages/admin/Users'
import Skills from '../pages/admin/Skills'

const AdminRoutes: React.FC = () => {
  return (
    <Routes>

        <Route path='/admin' element={<AdminLayout/>}>
            <Route path="login" element={<Login/>}/>
            <Route path="users" element={<Users/>}/>
            <Route path='skills' element={<Skills/>}/>
        </Route>
    </Routes>
  )
}

export default AdminRoutes
