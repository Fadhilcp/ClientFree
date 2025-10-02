import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

interface User {
    id: string;
    email: string;
    role: 'freelancer' | 'client';
}

type OtpPurpose = 'signup' | 'forgot-password' | 'email-change' | 'phone-change';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    otpEmail: string | null;
    otpPurpose: OtpPurpose | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    otpEmail: null,
    otpPurpose: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {

        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },

        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.otpEmail = null;
            state.otpPurpose = null;
        },

        setOtpInfo: (state, action: PayloadAction<{ email: string; purpose: OtpPurpose }>) => {
            state.otpEmail = action.payload.email;
            state.otpPurpose = action.payload.purpose;
        },

        clearOtpInfo: (state) => {
            state.otpEmail = null;
            state.otpPurpose = null;
        }
    }
});

export const { setCredentials, logout, setOtpInfo, clearOtpInfo } = authSlice.actions;
export default authSlice.reducer;
