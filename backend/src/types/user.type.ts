import { Document, Types } from "mongoose"; 

export interface IUserBase{
    username : string;
    email : string
    password ?: string;
    role : "freelancer" | "client" | "admin";
    status : "active" | "inactive" | "banned";
    provider: "local" | "google";
    lastLoginAt ?: Date;
}

export interface IUserProfile{

    name ?: string;
    phone ?: string;
    description ?: string;
    profileImage ?: string;

    location ?: {
        city ?: string;
        country ?: string;
        state ?: string;
    };

    isVerified ?: boolean;
    isPremium ?: boolean;
    activeSubscriptionId ?: string;

    notificationSettings ?: {
        app ?: boolean;
        email ?: boolean;
        sms ?: boolean;
        completeNotification ?: boolean;
    };

    stats ?: {
      earningTotal ?: number;
      jobsCompleted ?: number;
      reviewsCount ?: number;
      skillRatings ?: {
        skillId : string;
        avgRating ?: number;
        count ?: number;
      }[];
      totalProjectsPosted ?: number;
      totalSpent ?: number;
  };

  ratings ?: {
    asClient ?: number;
    asFreelancer ?: number;
  };

  skills ?: string[];

  professionalTitle ?: string;
  portfolio ?: {
    links ?: string[];
    portfolioFile ?: string;
    resume ?: string;
  };

  hourlyRate ?: string;
  about ?: string;
  experienceLevel ?: string;

  company ?: {
    industry ?: string;
    name ?: string;
    website ?: string;
  };

  interests ?: {
    type : "freelancerJob" | "clientFreelancer";
    jobId ?: string;
    targetUserId ?: string;
    status ?: "interested" | "notInterested";
    createdAt ?: Date;
    updatedAt ?: Date;
  }[];

  createdAt ?: Date;
  updatedAt ?: Date;
}

export type IUser = IUserBase & IUserProfile;

export type IUserDocument = IUser & Document & {
  _id: Types.ObjectId;
};


