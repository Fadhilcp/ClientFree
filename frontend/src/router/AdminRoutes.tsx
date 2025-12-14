import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from '../pages/admin/login'
import AdminLayout from '../layout/admin/AdminLayout'
import Users from '../pages/admin/Users'
import Skills from '../pages/admin/Skills'
import NoAuthProtectedRoute from './NoAuthProtectedRoute'
import AuthProtectedRoute from './AuthProtectedRoute'
import Subscriptions from '../pages/admin/Subscriptions'
import NotFoundPage from '../pages/user/NotFoundPage'
import AddOns from '../pages/admin/AddOns'
import MilestonePayouts from '../pages/admin/MilestonePayouts'
import DisputesPage from '../pages/admin/dispute/Disputes'
import DisputeDetailPage from '../pages/admin/dispute/DisputeDetailPage'

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
            <Route path='addOns' element={
              <AuthProtectedRoute allowedRoles={['admin']}>
                <AddOns/>
              </AuthProtectedRoute>
            }/>
            <Route path='payouts' element={
              <AuthProtectedRoute allowedRoles={['admin']}>
                <MilestonePayouts/>
              </AuthProtectedRoute>
            }/>
            <Route path='disputes' element={
              <AuthProtectedRoute allowedRoles={['admin']}>
                <DisputesPage/>
              </AuthProtectedRoute>
            }/>
            <Route path='dispute/:id' element={
              <AuthProtectedRoute allowedRoles={['admin']}>
                <DisputeDetailPage/>
              </AuthProtectedRoute>
            }/>

            <Route path="*" element={<NotFoundPage />} />
        </Route>
    </Routes>
  )
}

export default AdminRoutes