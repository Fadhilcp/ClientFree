import { Document, Types } from "mongoose"; 

export type UserRole = "freelancer" | "client" | "admin"

export interface IUserBase {
    username: string;
    email: string;
    password?: string;
    role: UserRole;
    status: "active" | "inactive" | "banned";
    provider: "local" | "google";
    lastLoginAt?: Date;
}

export interface IUserProfile {
    name?: string;
    phone?: string;
    description?: string;
    about?: string;
    profileImage?: string | null;

    location?: {
        city?: string;
        country?: string;
        state?: string;
    };
    
    isProfileCompleted?: boolean;
    isVerified?: boolean;
    subscription: string | Types.ObjectId | null;

    limits: {
        invitesRemaining: number;
        proposalsRemaining: number;
    };

    notificationSettings?: {
        app?: boolean;
        email?: boolean;
        sms?: boolean;
        completeNotification?: boolean;
    };

    stats?: {
        earningTotal?: number;
        jobsCompleted?: number;
        reviewsCount?: number;
        skillRatings?: {
            skillId: string;
            avgRating?: number;
            count?: number;
        }[];
        totalProjectsPosted?: number;
        totalSpent?: number;
    };

    ratings?: {
        asClient?: number;
        asFreelancer?: number;
    };

    skills?: string[];

    professionalTitle?: string;

    externalLinks?: {
        type: "github" | "linkedin" | "website" | "dribbble" | "behance" | "twitter";
        url: string;
    }[];

    portfolio?: {
        portfolioFile?: string;
        resume?: string;
    };

    hourlyRate?: number;
    experienceLevel?: string;

    company?: {
        industry?: string;
        name?: string;
        website?: string;
    };

    interests?: {
        type: "freelancerJob" | "clientFreelancer";
        jobId?: string;
        targetUserId?: string;
        createdAt?: Date;
        updatedAt?: Date;
    }[];

}

export type IUser = IUserBase & IUserProfile;

export type IUserDocument = IUser & Document & {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}