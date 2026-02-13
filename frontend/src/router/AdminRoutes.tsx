import React, { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

import AdminLayout from '../layout/admin/AdminLayout'
import NoAuthProtectedRoute from './NoAuthProtectedRoute'
import AuthProtectedRoute from './AuthProtectedRoute'

import Login from '../pages/admin/login';

const Users = lazy(() => import("../pages/admin/Users"));
const Skills = lazy(() => import("../pages/admin/Skills"));
const Subscriptions = lazy(() => import("../pages/admin/Subscriptions"));
const AddOns = lazy(() => import("../pages/admin/AddOns"));
const MilestonePayouts = lazy(() => import("../pages/admin/MilestonePayouts"));
const DisputesPage = lazy(() => import("../pages/admin/dispute/Disputes"));
const DisputeDetailPage = lazy(() => import("../pages/admin/dispute/DisputeDetailPage"));
const PayoutDetailPage = lazy(() => import("../pages/admin/PayoutDetailPage"));
const Payments = lazy(() => import("../pages/admin/Payments"));
const Withdrawals = lazy(() => import("../pages/admin/Withdrawals"));
const EscrowMilestones = lazy(() => import("../pages/admin/EscrowMilestones"));
const Wallets = lazy(() => import("../pages/admin/Wallets"));
const WalletTransactionsPage = lazy(() => import("../pages/admin/WalletTransactions"));
const AdminNotificationsPage = lazy(() => import("../pages/admin/AdminNotificationsPage"));
const NotFoundPage = lazy(() => import("../pages/user/NotFoundPage"));

const AdminRoutes: React.FC = () => {
  return (
    <Routes>

        <Route path="login" element={
          <NoAuthProtectedRoute>
            <Login/>
          </NoAuthProtectedRoute>
        }/>
        <Route element={<AdminLayout/>}>
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
            <Route path='notifications' element={
              <AuthProtectedRoute allowedRoles={['admin']}>
                <AdminNotificationsPage/>
              </AuthProtectedRoute>
            }/>

        </Route>
        <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AdminRoutes