export const endPoints = {
    AUTH : {
        LOGIN : '/auth/login',
        SIGNUP : '/auth/signUp',
        VERIFY_SIGNUP_OTP : '/auth/verifySignupOtp',
        VERIFY_OTP : '/auth/verifyOtp',
        VERIFY : '/auth/verify',
        REFRESH_TOKEN : '/auth/refresh',
        RESET_PASSWORD : '/auth/resetPassword',
        FORGOT_PASSWORD : '/auth/forgotPassword',
        RESEND_OTP : '/auth/resendOtp',
        GOOGLE: '/auth/google'
    },
    PROFILE : {
        GET_ME : '/profile/me',
        GET_BY_ID : (userId: string) => `/profile/${userId}`,
        CREATE : '/profile',
        UPDATE_ME : '/profile/me',
        LIST : (seach: string, page: number, limit:number) => `/profile?search=${seach}&page=${page}&limt=${limit}`
    },
    SKILL: {
        GET_ACTIVE: '/skills/active',
        CREATE: '/skills',
        GET_ALL: (search: string, page: number, limit:number) => `/skills?search=${search}&page=${page}&limt=${limit}`,
        BY_CATEGORY: (category: string) => `/skills?category=${category}`, //GET
        BY_ID: (skillId: string) => `/skills/${skillId}`, //PATCH/DELETE
    },
    PLAN: {
        LIST: (search: string, status:string, page: number, limit:number) => `/plans?search=${search}&status=${status}&page=${page}&limt=${limit}`,
        GET_ACTIVE: (userType: string) =>  `/plans/active?userType=${userType}`,
        CREATE: '/plans',
        BY_ID: (planId: string) => `/plans/${planId}` //GET/PUT/DELETE
    },
    SUBSCRIPTION: {
        GET_LIST: (search:string, status:string, page: number, limit:number) => `/subscription?search=${search}&status=${status}&page=${page}&limt=${limit}`,
        CREATE: '/subscription',
        VERIFY: '/subscription/verify',
        CANCEL: '/subscription/cancel',
        CURRENT: '/subscription/current'
    }
}