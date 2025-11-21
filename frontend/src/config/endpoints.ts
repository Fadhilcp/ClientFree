export const endPoints = {
    AUTH : {
        LOGIN : '/auth/login',
        SIGNUP : '/auth/signup',
        VERIFY_SIGNUP_OTP : '/auth/verify-signup-otp',
        VERIFY_OTP : '/auth/verify-otp',
        ACCESS_TOKEN : '/auth/access',
        REFRESH_TOKEN : '/auth/refresh',
        RESET_PASSWORD : '/auth/reset-password',
        FORGOT_PASSWORD : '/auth/forgot-password',
        CHANGE_PASSWORD: '/auth/change-password',
        RESEND_OTP : '/auth/resend-otp',
        GOOGLE: '/auth/google',
        LOGOUT: '/auth/logout',
    },
    USER : {
        GET_ME : '/user/me',
        GET_BY_ID : (userId: string) => `/user/${userId}`,
        CREATE : '/user',
        UPDATE_ME : '/user/me',
        UPDATE_PROFILE_IMAGE: '/user/profile-image',
        LIST : (seach: string, page: number, limit:number) => 
            `/user?search=${seach}&page=${page}&limt=${limit}`,

        UPDATE_STATUS : (userId: string) => `/user/${userId}/status`
    },
    SKILL: {
        GET_ACTIVE: '/skills/active',
        CREATE: '/skills',
        GET_ALL: (search: string, page: number, limit:number) => 
            `/skills?search=${search}&page=${page}&limt=${limit}`,

        BY_CATEGORY: (category: string) => `/skills?category=${category}`, //GET
        BY_ID: (skillId: string) => `/skills/${skillId}`, //PATCH/DELETE
    },
    PLAN: {
        LIST: (search: string, status:string, page: number, limit:number) => 
            `/plans?search=${search}&status=${status}&page=${page}&limt=${limit}`,

        GET_ACTIVE: (userType: string) =>  `/plans/active?userType=${userType}`,
        CREATE: '/plans',
        BY_ID: (planId: string) => `/plans/${planId}` //GET/PUT/DELETE
    },
    SUBSCRIPTION: {
        GET_LIST: (search:string, status:string, page: number, limit:number) => 
            `/subscription?search=${search}&status=${status}&page=${page}&limt=${limit}`,

        CREATE: '/subscription',
        VERIFY: '/subscription/verify',
        CANCEL: '/subscription/cancel',
        CURRENT: '/subscription/current'
    },
    JOB: {
        LIST: (search: string, status: string, page: number, limit: number) =>
            `/jobs?search=${search}&status=${status}&page=${page}&limit=${limit}`,

        CREATE: '/jobs',
        MY_JOBS: (status: string) => `/jobs/my?status=${status}`, 
        BY_ID: (jobId: string) => `/jobs/${jobId}`, // GET / PUT / DELETE
        ADD_PROPOSAL: (jobId: string) => `/jobs/${jobId}/proposal`, // POST
    }
}