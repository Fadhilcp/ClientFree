import axios from "../lib/axios";
import { endPoints } from "../config/endpoints";
import type { ChangePasswordType } from "../pages/user/settings/SecuritySetting";

interface Idata {
    username : string;
    email : string;
    password : string;
    role : string;
}

class AuthService {
    signUp(data : Idata) {
        return axios.post(endPoints.AUTH.SIGNUP, data);
    }

    login(data : Partial<Idata>) {
        return axios.post(endPoints.AUTH.LOGIN, data);
    }

    verifySignupOtp(email : string, otp : string, purpose : string){
        return axios.post(endPoints.AUTH.VERIFY_SIGNUP_OTP, {email, otp, purpose});
    }

    verifyOtp(email : string, otp : string, purpose : string){
        return axios.post(endPoints.AUTH.VERIFY_OTP, {email, otp, purpose});
    }

    forgotPassword(email : string) {
        return axios.post(endPoints.AUTH.FORGOT_PASSWORD, {email});
    }

    resetPassword(email : string, password : string){
        return axios.post(endPoints.AUTH.RESET_PASSWORD, {email, password});
    }

    resendOtp(email : string, purpose : string) {
        return axios.post(endPoints.AUTH.RESEND_OTP, {email, purpose});
    }

    refreshToken(){
        return axios.get(endPoints.AUTH.REFRESH_TOKEN);
    }

    googleAuth(token: string,role: string){
        return axios.post(endPoints.AUTH.GOOGLE, {token, role});
    }

    verifyUser() {
        return axios.get(endPoints.AUTH.VERIFY);
    }

    changePassword(data: ChangePasswordType){
        return axios.put(endPoints.AUTH.CHANGE_PASSWORD, data);
    }
}

export const authService = new AuthService();