export const endPoints = {
    AUTH : {
        LOGIN : '/auth/login',
        SIGNUP : '/auth/signUp',
        VERIFY_SIGNUP_OTP : '/auth/verifySignupOtp',
        VERIFY_OTP : '/auth/verifyOtp',
        REFRESH_TOKEN : '/auth/refresh',
        RESET_PASSWORD : '/auth/resetPassword',
        FORGOT_PASSWORD : '/auth/forgotPassword',
        RESEND_OTP : '/auth/resendOtp'
    },
    PROFILE : {
        GET_ME : '/profile/me',
        GET_BY_ID : (userId: string) => `/profile/${userId}`,
        CREATE : '/profile',
        UPDATE_ME : '/profile/me',
        LIST : '/profiles'
    },
    SKILL: {
        ROOT: '/skills',
        BY_CATEGORY: (category: string) => `/skills?category=${category}`,
        BY_ID: (skillId: string) => `/skills/${skillId}`,
    }
}