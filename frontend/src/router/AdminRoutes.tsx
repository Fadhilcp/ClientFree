import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from '../pages/admin/login'
import AdminLayout from '../layout/AdminLayout'
import Users from '../pages/admin/Users'
import Skills from '../pages/admin/Skills'
import NoAuthProtectedRoute from './NoAuthProtectedRoute'
import AuthProtectedRoute from './AuthProtectedRoute'
import Subscriptions from '../pages/admin/Subscriptions'

const AdminRoutes: React.FC = () => {
  return (
    <Routes>

        <Route path="/admin/login" element={
          <NoAuthProtectedRoute>
            <Login/>
          </NoAuthProtectedRoute>
        }/>
        <Route path='/admin' element={<AdminLayout/>}>
            <Route path="users" element={
              <AuthProtectedRoute allowedRoles={['admin']}>
                <Users/>
              </AuthProtectedRoute>
            }/>
            <Route path='skills' element={
              <AuthProtectedRoute allowedRoles={['admin']}>
                <Skills/>
              </AuthProtectedRoute>
            }/>
            <Route path='subscriptions' element={
              <AuthProtectedRoute allowedRoles={['admin']}>
                <Subscriptions/>
              </AuthProtectedRoute>
            }/>
        </Route>
    </Routes>
  )
}

export default AdminRoutes