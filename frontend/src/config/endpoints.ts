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
        LIST_FREELANCERS: (cursor: string, limit:number, search: string) => 
            `/user/freelancers?cursor=${cursor || ""}&limit=${limit}&search=${search}`,
        
        LIST : (seach: string, page: number, limit:number, role?: string) => 
            `/user?search=${seach}&page=${page}&limt=${limit}${role ? `&status=${role}` : ""}`,

        UPDATE_STATUS : (userId: string) => `/user/${userId}/status`,
        GET_INTERESTED: (cursor: string, limit:number, search: string) => 
            `/user/interested?cursor=${cursor || ""}&limit=${limit}&search=${search}`,
        ADD_INTERESTED: (freelancerId: string) => `/user/${freelancerId}/interest`,
        REMOVE_INTERESTED: (freelancerId: string) => `/user/${freelancerId}/interest`,
        SEARCH: (search: string, page: number, limit: number) => 
            `/user/search?search=${search ?? ""}&page=${page ?? 1}&limit=${limit ?? 10}`,
        USERS_BY_ID: '/user/by-ids',
    },
    SKILL: {
        GET_ACTIVE: '/skills/active',
        CREATE: '/skills',
        GET_ALL: (search: string, page: number, limit:number) => 
            `/skills?search=${search}&page=${page}&limit=${limit}`,

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
        CURRENT: '/subscription/current',
        ACTIVE_ME: '/subscription/me',
        GET_HISTORY: (page: number, limit: number) => `/subscription/history?page=${page}&limt=${limit}`,
    },
    JOB: {
        LIST: (search: string, status?: string, cursor?: string, limit?: number) =>
            `/jobs?status=${status || ""}&search=${search}&cursor=${cursor || ""}&limit=${limit}`,

        CREATE: '/jobs',
        MY_JOBS: (status: string, search: string, cursor?: string, limit?: number) => 
            `/jobs/client/me?status=${status}&search=${search}&cursor=${cursor || ""}&limit=${limit}`,

        FREELANCER_JOBS: (status: string, search: string, cursor?: string, limit?: number) => 
            `/jobs/freelancer/me?status=${status}&search=${search}&cursor=${cursor || ""}&limit=${limit}`,

        BY_ID: (jobId: string) => `/jobs/${jobId}`, // GET / PUT / DELETE
        ADD_PROPOSAL: (jobId: string) => `/jobs/${jobId}/proposal`, // POST
        UPDATE_STATUS: (jobId: string) => `/jobs/${jobId}/status`,// PATCH
        START_JOB: (jobId: string) =>  `/jobs/${jobId}/activate`,
        GET_INTERESTED: (search: string, cursor?: string, limit?: number) =>
            `/jobs/interested?cursor=${cursor}&limit=${limit}&search=${search}`,
        ADD_INTERESTED: (jobId: string) => `/jobs/${jobId}/interest`,
        REMOVE_INTERESTED: (jobId: string) => `/jobs/${jobId}/interest`,
        CANCEL_JOB: (jobId: string) => `/jobs/${jobId}/cancel`,
    },
    PROPOSAL: {
        CREATE: "/proposal",                          // POST
        BY_ID: (id: string) => `/proposal/${id}`,     // GET / PUT
        UPDATE: (id: string) => `/proposal/${id}`,    // PUT
        UPDATE_STATUS: (id: string) => `/proposal/${id}/status`, // PATCH
        FOR_JOB: (jobId: string, status?: string, invitation?: boolean, page?: number, limit?: number) => 
            `/proposal/job/${jobId}?status=${status ?? ""}&invitation=${invitation ?? ""}&page=${page ?? 1}&limit=${limit ?? 10}`,    // GET proposals for job

        ACCEPT_PROPOSAL: (proposalId: string) => `/proposal/${proposalId}/accept`,
        CANCEL_PROPOSAL: (proposalId: string) => `/proposal/${proposalId}/cancel`,
        INVITE: (jobId: string, freelancerId: string) => `/proposal/job/${jobId}/invite/${freelancerId}`,
        ACCEPT_INVITE: (jobId: string, freelancerId: string) => `/proposal/job/${jobId}/invitation/${freelancerId}/accept`,
        MY_PROPOSAL: (isInvitation: boolean, search: string, cursor: string, limit:number) => 
            `/proposal/me?isInvitation=${isInvitation}&search=${search}&cursor=${cursor || ""}&limit=${limit}`,

        CLIENT_PROPOSAL: (isInvitation: boolean, search: string, cursor?: string, limit?: number) => 
                `/proposal/client?isInvitation=${isInvitation ?? false}&search=${search}&cursor=${cursor || ""}&limit=${limit}`,

        VERIFY: '/proposal/verify-upgrade-payment',
        WITHDRAW_INVITATION: (proposalId: string) => `/proposal/${proposalId}/withdraw-invitation`,
    },
    ASSIGNMENT: {
        GET_JOB_ASSIGNMENTS: (jobId: string) => `/assignment/job/${jobId}`,
        ADD_MILESTONE: (assignmentId: string) => `/assignment/${assignmentId}/milestones`,
        UPDATE_MILESTONE: (assignmentId: string, milestoneId: string) => 
            `/assignment/${assignmentId}/milestones/${milestoneId}`,
        CANCEL_MILESTONE: (assignmentId: string, milestoneId: string) => 
            `/assignment/${assignmentId}/${milestoneId}/cancel`,
        SUBMIT_MILESTONE: (assignmentId: string, milestoneId: string) => 
            `/assignment/${assignmentId}/${milestoneId}/submit`,
        REQUEST_CHANGE: (assignmentId: string, milestoneId: string) => 
            `/assignment/${assignmentId}/${milestoneId}/request-changes`,
        APPROVE: (assignmentId: string, milestoneId: string) => 
            `/assignment/${assignmentId}/${milestoneId}/approve`,
        DISPUTE: (assignmentId: string, milestoneId: string) => 
            `/assignment/${assignmentId}/${milestoneId}/dispute`,
        GET_APPROVED:(search: string, page: number, limit:number) => 
            `/assignment/approved?search=${search}&page=${page}&limit=${limit}`,

        GET_APPROVED_BY_ID:(assignmentId: string, milestoneId: string) => 
            `/assignment/${assignmentId}/${milestoneId}/approved`,

        GET_FILE_URL: (assignmentId: string, milestoneId: string, key: string) => 
            `/assignment/${assignmentId}/${milestoneId}/file/${key}`,
        GET_ESCROW_MILESTONES: (page: number, limit: number) => 
            `/assignment/escrow-milestones?page=${page ?? 1}&limit=${limit ?? 10}`,
        GET_ALL_ESCROW_MILESTONES: (search: string, page: number, limit: number) => 
            `/assignment/admin/escrow-milestones?search=${search}&page=${page ?? 1}&limit=${limit ?? 10}`,
    },
    PAYMENTS: {
        GET_ALL: (search: string, page: number, limit: number) => `/payment?search=${search}&page=${page ?? 1}&limit=${limit ?? 10}`,
        CREATE_ORDER: (assignmentId: string,milestoneId: string) => `/payment/milestones/${assignmentId}/${milestoneId}/fund`,
        VERIFY: '/payment/verify',
        REFUND: (paymentId: string) => `/payment/${paymentId}/refund`,
        RELEASE: (paymentId: string) => `/payment/${paymentId}/release`,
        GET_DISPUTES:(search: string, page: number, limit:number) =>
            `/payment/disputes?search=${search}&page=${page}&limit=${limit}`,
        
        DISPUTE_BY_ID: (paymentId: string) => `/payment/${paymentId}/dispute`,
        WITHDRAW: '/payment/withdraw',
        GET_WITHDRAWALS: (page: number, limit: number) => `/payment/withdrawals?page=${page ?? 1}&limit=${limit ?? 10}`,
        GET_ADMIN_WITHDRAWALS: (search: string, page: number, limit: number) => 
            `/payment/admin/withdrawals?search=${search}&page=${page ?? 1}&limit=${limit ?? 10}`,
    },
    ADDONS: {
        CREATE: '/addOns',
        BY_ID: (addOnId: string) => `/addOns/${addOnId}`, //PUT / GET / DELETE
        TOGGLE_ACTIVE: (addOnId: string) => `/addOns/${addOnId}/toggle`,
        GET_ALL:(search: string, page: number, limit:number) =>
            `/addOns?search=${search}&page=${page}&limit=${limit}`,
        GET_ACTIVE: '/addOns/active',
    },
    CLARIFICATION: {
        ADD_MESSAGE: (jobId: string) => `/clarification/${jobId}/message`,
        GET_BOARD: (jobId: string) => `/clarification/${jobId}`,
        CLOSE_BOARD: (jobId: string) => `/clarification/${jobId}/close`,
    },
    WALLET: {
        GET: (page: number, limit: number) => `/wallet/me?page=${page ?? 1}&limit=${limit ?? 10}`,
        GET_ESCROW: (page: number, limit: number) => `/wallet/escrow?page=${page ?? 1}&limit=${limit ?? 10}`,
        GET_TRANSACTIONS: (page: number, limit: number) => `/wallet/transactions?page=${page ?? 1}&limit=${limit ?? 10}`,
        GET_INVOICES: (page: number, limit: number) => `/wallet/invoices?page=${page ?? 1}&limit=${limit ?? 10}`,
        INVOICE_DOWNLOAD: (transactionId: string) => `/wallet/invoices/${transactionId}/download`,
        GET_REPORT: (from: string, to: string) => `/wallet/reports?from=${from}&to=${to}`,
        GET_ALL_WALLETS: (search: string, page: number, limit: number) => 
            `/wallet?search=${search}&page=${page ?? 1}&limit=${limit ?? 10}`,
        GET_USER_WALLET_TRANSACTIONS: (walletId: string, search?: string, page?: number, limit?: number) => 
            `/wallet/${walletId}/transactions?search=${search ?? ""}&page=${page ?? 1}&limit=${limit ?? 10}`,
    },
    DASHBOARD: {
        GET_PAYMENTS_OVERVIEW: '/dashboard/payments-overview',
    },
    MATCH: {
        GET_BEST_JOBS: (search: string, cursor?: string, limit?: number) =>
            `/match/jobs?search=${search ?? ""}&cursor=${cursor || ""}&limit=${limit}`,

        GET_BEST_FREELANCERS:(jobId: string, search: string, cursor?: string, limit?: number) => 
            `/match/freelancers/${jobId}?search=${search ?? ""}&cursor=${cursor || ""}&limit=${limit}`
    },
    NOTIFICATION: {
        GET_MY: (page: number, limit: number) => `/notification/me?page=${page ?? 1}&limit=${limit ?? 1}`,
        CREATE: "/notification",
        UPDATE: (notificationId: string) => `/notification/${notificationId}`,
        DELETE: (notificationId: string) => `/notification/${notificationId}`,
        MARK_READ: (notificationId: string) => `/notification/${notificationId}/read`,
        COUNT_UNREAD: "/notification/unread-count",
        MARK_ALL_READ: "/notification/read-all",
        GET_ADMIN: (search: string, page: number, limit: number) => 
            `/notification/admin?search=${search ?? ""}&page=${page ?? 1}&limit=${limit ?? 1}`,
    },
    CHAT: {
        CREATE_OR_GET: '/chats',
        GET_MY_CHATS: (search: string) => `/chats/my?search=${search ?? ""}`,
        BLOCK: (chatId: string) => `/chats/${chatId}/block-status`,
    },
    MESSAGE: {
        SEND: (chatId: string) => `/messages/${chatId}`,
        GET_BY_CHAT: (chatId: string) => `/messages/${chatId}`,
        MARK_READ: (chatId: string) => `/messages/${chatId}/read`,
        DELETE: (messageId: string) => `/messages/${messageId}`,
        SIGNED_URL: (messageId: string) => `/messages/file/${messageId}/signed-url`,
    },
}