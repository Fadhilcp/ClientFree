import React, { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import UserLayout from "../layout/user/UserLayout";

import ProtectedRoute from "./ProtectedRoute";
import AuthProtectedRoute from "./AuthProtectedRoute";
import NoAuthProtectedRoute from "./NoAuthProtectedRoute";
import SettingsLayout from "../layout/user/SettingsLayout";
import JobLayout from "../layout/user/JobLayout";
import FindJobsLayout from "../layout/user/FindJobsLayout";
import FreelancersLayout from "../layout/user/FreelancersListLayout";
import MyPrposalsLayout from "../layout/user/MyProposalsLayout";
import PaymentsLayout from "../layout/user/PaymentsLayout";

import BillingSuccess from "../components/user/billing/BillingSuccess";
import BillingCancel from "../components/user/billing/BillingCancel";

import HeroSection from "../pages/user/landingPage/HeroSection";
import RoleSelect from "../pages/auth/roleSelect";
import SignUp from "../pages/auth/signUp";
import Login from "../pages/auth/login";

const VerifyOtp = lazy(() => import("../pages/auth/verifyOtp"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));

const Home = lazy(() => import("../pages/user/Home"));
const Profile = lazy(() => import("../pages/user/profile/Profile"));
const JobsPage = lazy(() => import("../pages/user/job/JobsPage"));
const JobDetailPage = lazy(() => import("../pages/user/job/JobDetailPage"));
const BrowseJobsPage = lazy(() => import("../pages/user/find jobs/BrowseJobsPage"));

const Subscriptions = lazy(() => import("../pages/user/Subscriptions"));
const FreelancersPage = lazy(() => import("../pages/user/freelancers/FreelancersPage"));
const UserDetailPage = lazy(() => import("../pages/user/UserDetailPage"));
const MyProposals = lazy(() => import("../pages/user/my proposals/MyProposals"));
const ProposalAndInvitation = lazy(() => import("../pages/user/my proposals/ProposalAndInvitation"));

const NotificationsPage = lazy(() => import("../pages/user/notification/NotificationsPage"));
const Chat = lazy(() => import("../pages/user/chat/Chat"));

const WalletPage = lazy(() => import("../pages/user/payments/WalletPage"));

const TransactionsPage = lazy(() => import("../pages/user/payments/TransactionsPage"));
const InvoicesAndReports = lazy(() => import("../pages/user/payments/Invoices-Report"));
const InEscrowPage = lazy(() => import("../pages/user/payments/InEscrowPage"));
const WithdrawalsPage = lazy(() => import("../pages/user/payments/WithdrawalsPage"));
const EscrowAndMilestonesPage = lazy(() => import("../pages/user/payments/Escrow-Milestones"));
const OverviewPage = lazy(() => import("../pages/user/payments/OverviewPage"));

const NotFoundPage = lazy(() => import("../pages/user/NotFoundPage"));

const SecuritySetting = lazy(() => import("../pages/user/settings/SecuritySetting"));
const SubscriptionSetting = lazy(() => import("../pages/user/settings/Subscription-Premium"));

const UserRoutes: React.FC = () => {

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
            <Route path="/forgot-password" element={
                <NoAuthProtectedRoute>
                    <ForgotPassword/>
                </NoAuthProtectedRoute>
            }/>
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
                path="/notifications"
                element={
                <AuthProtectedRoute allowedRoles={['client','freelancer']}>
                    <NotificationsPage />
                </AuthProtectedRoute>
                }
            />
            <Route
                path="/chats"
                element={
                <AuthProtectedRoute allowedRoles={['client','freelancer']}>
                    <Chat />
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

            <Route path="/billing/success" element={<BillingSuccess />} />
            <Route path="/billing/cancel" element={<BillingCancel />} />

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
                <Route path="hired-jobs" element={<JobsPage status="pending" title="Hired Jobs" />}/>
                <Route path="completed-jobs" element={<JobsPage status="completed" title="Completed Jobs" />}/>
                <Route path="proposals-invitations" element={<ProposalAndInvitation/>}/>
            </Route>
            <Route
                path="/job-details/:id"
                element={
                    <AuthProtectedRoute allowedRoles={["client", "freelancer"]}>
                    <JobDetailPage /> 
                    </AuthProtectedRoute>
                }
            />
            {/* Job routes under user layout - end */}
            {/* Payments routes under user layout - start */}
            <Route path="/payments" element={
                <AuthProtectedRoute allowedRoles={['client','freelancer']}>
                    <PaymentsLayout/>
                </AuthProtectedRoute>
            }>
                <Route index element={<Navigate to="overview" replace />} />
                {/* shared routes(client, freelancer) */}
                <Route path="overview" element={<OverviewPage/>}/>
                <Route path="wallet" element={<WalletPage/>}/>
                <Route path="transactions" element={<TransactionsPage/>}/>
                <Route path="invoices-reports" element={<InvoicesAndReports/>}/>
                <Route path="withdrawals" element={<WithdrawalsPage />}/>

                <Route path="escrow" element={
                    <AuthProtectedRoute allowedRoles={["freelancer"]}>
                        <InEscrowPage />
                    </AuthProtectedRoute>
                }/>
                <Route path="escrow-milestones" element={
                    <AuthProtectedRoute allowedRoles={["client"]}>
                        <EscrowAndMilestonesPage />
                    </AuthProtectedRoute>
                }/>
            </Route>
            {/* Payments routes under user layout - end */}
            <Route
              path="/users/:userId"
              element={
                <AuthProtectedRoute allowedRoles={["client", "freelancer"]}>
                    <UserDetailPage/>
                </AuthProtectedRoute>
              }
            />
            {/* my proposals routes - freelancer - start */}
            <Route path="/my-proposals" element={
                <AuthProtectedRoute allowedRoles={['freelancer']}>
                    <MyPrposalsLayout/>
                </AuthProtectedRoute>
            }>
                <Route path="" element={<MyProposals/>}/>
                <Route path="invites" element={<MyProposals/>} />
            </Route>
            {/* my proposals routes - freelancer - end */}
            {/* find jobs routes - freelancer - start */}
            <Route path="/find-jobs" element={
                <AuthProtectedRoute allowedRoles={['freelancer']}>
                    <FindJobsLayout/>
                </AuthProtectedRoute>
            }>
                <Route path="" element={<BrowseJobsPage/>}/>
                <Route path="interested" element={<BrowseJobsPage/>} />
            </Route>
            {/* find jobs routes - freelancer - end */}
            {/* find freelancer routes - client - start */}
            <Route path="/freelancers" element={
                <AuthProtectedRoute allowedRoles={['client']}>
                    <FreelancersLayout/>
                </AuthProtectedRoute>
            }>
                <Route path="" element={<FreelancersPage/>}/>
                <Route path="interested" element={<FreelancersPage/>} />
            </Route>
            {/* find freelancer routes - client - end */}
            {/* Setting routes under user layout - start */}
            <Route path="/settings" element={
                <AuthProtectedRoute allowedRoles={['client','freelancer']}>
                    <SettingsLayout/>
                </AuthProtectedRoute>
            }>
                <Route index element={<Navigate to="account-security" replace />} />
                <Route path="account-security" element={<SecuritySetting/>}/>
                <Route path="subscription-premium" element={<SubscriptionSetting/>}/>
            </Route>
            {/* Setting routes under user layout - end */}

            <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    )
}

export default UserRoutes;