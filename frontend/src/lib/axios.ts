import axios from "axios";
import { env } from "../config/env";
import { authService } from "../services/auth.service";
import { notify } from "../utils/toastService";

const instance = axios.create({
    baseURL : env.API_BASE_URL,
    headers : {
        'Content-Type' : 'application/json'
    },
    withCredentials : true
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if(token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    // when detect formData, change the content type into multipart
    const isFormData = config.data instanceof FormData;
    if (isFormData) {
        delete config.headers["Content-Type"];
    } else {
        config.headers["Content-Type"] = "application/json";
    }

    return config
});

instance.interceptors.response.use((response) => response,
   async (error) => {
    const originalRequest = error.config;

    if(
        error.response?.status === 401 && 
        error.response.data?.code === "TOKEN_EXPIRED" && 
        !originalRequest._retry
    ) {
        //to prevent infinte loop of request
        originalRequest._retry = true

        try {
            const refreshReponse = await authService.refreshToken();
            const { token } = refreshReponse.data;

            localStorage.setItem('token', token);
            
            originalRequest.headers.Authorization = `Bearer ${token}`;
            
        } catch (error) {
            localStorage.removeItem('token');
            notify.error('Session expired. Please log in again.');
            return Promise.reject(error)
        }
    }
    return Promise.reject(error)
   }
);

export default instance;