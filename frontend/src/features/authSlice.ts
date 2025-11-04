import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

interface User {
    _id: string;
    email: string;
    role: 'freelancer' | 'client' | 'admin';
    username: string;
    profileImage: string;
    phone: string;
}

type OtpPurpose = 'signup' | 'forgot-password' | 'email-change' | 'phone-change';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    otpEmail: string | null;
    otpPurpose: OtpPurpose | null;
    isNewUser: boolean;
    loading: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    otpEmail: null,
    otpPurpose: null,
    isNewUser: false,
    loading: true
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
        finishLoading: (state) => {
            state.loading = false;
        },
    }
});

export const { setCredentials, logout, setOtpInfo, clearOtpInfo, resetNewUser, finishLoading } = authSlice.actions;
export default authSlice.reducer;
