import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from '../pages/admin/login'
import AdminLayout from '../layout/admin/AdminLayout'
import Users from '../pages/admin/Users'
import Skills from '../pages/admin/Skills'
import NoAuthProtectedRoute from './NoAuthProtectedRoute'
import AuthProtectedRoute from './AuthProtectedRoute'
import Subscriptions from '../pages/admin/Subscriptions'
import AddOns from '../pages/admin/AddOns'
import MilestonePayouts from '../pages/admin/MilestonePayouts'
import DisputesPage from '../pages/admin/dispute/Disputes'
import DisputeDetailPage from '../pages/admin/dispute/DisputeDetailPage'
import PayoutDetailPage from '../pages/admin/PayoutDetailPage'
import Payments from '../pages/admin/Payments'
import Withdrawals from '../pages/admin/Withdrawals'
import EscrowMilestones from '../pages/admin/EscrowMilestones'
import Wallets from '../pages/admin/Wallets'
import WalletTransactionsPage from '../pages/admin/WalletTransactions'

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
            <Route path='payouts/:assignmentId/:milestoneId' element={
              <AuthProtectedRoute allowedRoles={['admin']}>
                <PayoutDetailPage/>
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
            <Route path='payments' element={
              <AuthProtectedRoute allowedRoles={['admin']}>
                <Payments/>
              </AuthProtectedRoute>
            }/>
            <Route path='withdrawals' element={
              <AuthProtectedRoute allowedRoles={['admin']}>
                <Withdrawals/>
              </AuthProtectedRoute>
            }/>
            <Route path='escrow-milestones' element={
              <AuthProtectedRoute allowedRoles={['admin']}>
                <EscrowMilestones/>
              </AuthProtectedRoute>
            }/>
            <Route path='wallets' element={
              <AuthProtectedRoute allowedRoles={['admin']}>
                <Wallets/>
              </AuthProtectedRoute>
            }/>
            <Route path='wallets/:walletId/transactions' element={
              <AuthProtectedRoute allowedRoles={['admin']}>
                <WalletTransactionsPage/>
              </AuthProtectedRoute>
            }/>


        </Route>
        {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  )
}

export default AdminRoutes