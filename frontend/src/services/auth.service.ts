import axios from "../lib/axios";
import { endPoints } from "../config/endpoints";

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

    verifyOtp(email : string, otp : string){
        return axios.post(endPoints.AUTH.VERIFY_OTP, {email, otp});
    }

    refreshToken(){
        return axios.get(endPoints.AUTH.REFRESH_TOKEN);
    }
}

export const authService = new AuthService();