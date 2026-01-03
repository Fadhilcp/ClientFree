import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface User {
    id: string;
    email: string;
    role: 'freelancer' | 'client' | 'admin';
    status: 'active' | 'inactive' | 'banned';
    username: string;
    profileImage: string;
    phone: string;
    isProfileComplete: boolean;
    name: string;
}

type OtpPurpose = 'signup' | 'forgot-password' | 'email-change' | 'phone-change';

interface PlanFeatures {
  VerifiedBadge: boolean;
  PremiumSupport: boolean;
  BestMatch: boolean;
  HigherJobVisibility: boolean;
  UnlimitedInvites: boolean;
  DirectMessaging: boolean;
  AIProposalShortlisting: boolean;
  HigherProfileVisibility: boolean;
  UnlimitedProposals: boolean;
  PriorityNotifications: boolean;
}

interface SubscriptionInfo {
  planName: string;
  userType: 'client' | 'freelancer';
  features: PlanFeatures;
  expiryDate: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    subscription: SubscriptionInfo | null;
    otpEmail: string | null;
    otpPurpose: OtpPurpose | null;
    isNewUser: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    subscription: null,
    otpEmail: null,
    otpPurpose: null,
    isNewUser: false
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {

        setCredentials: (state, action: PayloadAction<{ user: User; token: string, isNewUser ?: boolean  }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            if(action.payload.isNewUser !== undefined){
                state.isNewUser = action.payload.isNewUser;
            }
        },

        logout: (state) => {
            state.user = null;
            state.token = null;
            state.subscription = null;
            state.isAuthenticated = false;
            state.otpEmail = null;
            state.otpPurpose = null;
            state.isNewUser = false;
        },

        setOtpInfo: (state, action: PayloadAction<{ email: string; purpose: OtpPurpose }>) => {
            state.otpEmail = action.payload.email;
            state.otpPurpose = action.payload.purpose;
        },

        clearOtpInfo: (state) => {
            state.otpEmail = null;
            state.otpPurpose = null;
        },

        resetNewUser: (state) => {
            state.isNewUser = false;
        },
        setUser: (state, action: PayloadAction<Partial<User>>) => {
            if(state.user){
                state.user = { ...state.user, ...action.payload };
            }
        },
        setSubscription: (
            state,
            action: PayloadAction<SubscriptionInfo | null>
        ) => {
            state.subscription = action.payload;
        },
    }
});

export const { 
    setCredentials,
    logout,
    setOtpInfo,
    clearOtpInfo,
    resetNewUser,
    setUser,
    setSubscription,
 } = authSlice.actions;
export default authSlice.reducer;
