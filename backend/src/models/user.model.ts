import { model, Schema } from "mongoose";
import { IUserDocument } from "../types/user.type";

const userSchema = new Schema({

    username : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password: {
        type: String,
        required: function (this: IUserDocument) {
            return this.provider === "local";
        },
    },
    role : {
        type : String,
        enum : ["freelancer", "client", "admin"]
    },
    provider: {
        type: String,
        enum: ["local", "google"],
        required: true,
    },
    status : {
        type : String,
        enum : ["active", "inactive", "banned"],
        default : "active"
    },
    lastLoginAt : { type : Date , default : Date.now },

    name : { type : String },
    phone : { type : String },
    description : { type : String },
    profileImage : { type : String },

    location : {
        city : { type : String },
        country : { type : String },
        state : { type : String }
    },

    isVerfied : {
        type : Boolean,
        default : false
    },
    // ====
    // isPremium : { 
    //     type : Boolean,
    //     default : false
    // },
    // activeSubscriptionId : {
    //     type : Schema.Types.ObjectId,
    //     ref : "Subscription"
    // },
    subscription: { 
        type: Schema.Types.ObjectId, 
        ref: "Subscription", 
        default: null 
    },
    limits: {
        invitesRemaining: { type: Number, default: 10 },     
        proposalsRemaining: { type: Number, default: 5 }       
    },

    stripeCustomerId: { type: String, default: null },
    // ====
    notificationSettings : {
        app : { type : Boolean, default : true },
        email : { type : Boolean, default : true },
        sms : { type : Boolean , default : true },
        completeNotification : { type : Boolean , default : true }
    },
    stats : {
        earningTotal : { type : Number , default : 0 },
        jobsCompleted : { type : Number , default : 0 },
        reviewsCount : { type : Number , default : 0 },

        skillRatings : [{
            skillId : { type : Schema.Types.ObjectId , ref : "Skills" },
            avgRating : { type : Number , default : 0 },
            count : { type : Number , default : 0 }
        }],

        totalProjectsPosted : { type : Number , default : 0 },
        totalSpent : { type : Number , default : 0 }
    },

    ratings : {
        asClient : { type : Number , default : 0 },
        asFreelancer : { type : Number , default : 0 }
    },

    skills : [{ type : Schema.Types.ObjectId , ref : "Skills" }],
    professionalTitle : { type : String },
    externalLinks: [
        {
            type: { type: String, enum: ["github", "linkedin", "website", "dribbble", "behance", "twitter"] },
            url: { type: String }
        }
    ],
    portfolio: {
        portfolioFile: { type: String },
        resume: { type: String }
    },

    hourlyRate : { type : String },
    about : { type : String },
    experienceLevel : { type : String },

    company : {
        industry : { type : String },
        name : { type : String },
        website : { type : String }
    },

    interests : [{ 

        type : {
            type : String,
            enum : ["freelancerJob", "clientFreelancer"],
            required : true
        },
        jobId : {
            type : Schema.Types.ObjectId,
            ref : "Jobs"
        },
        targetUserId : {
            type : Schema.Types.ObjectId,
            ref : "Users"
        },
        status : { 
            type : String,
            enum : ["interested", "notInterested"],
            default : "interested"
        },
        createdAt : { type : Date, default : Date.now },
        updatedAt : { type : Date, default : Date.now },
    }],

    createdAt : { type : Date , default : Date.now },
    updatedAt : { type : Date , default : Date.now },
});

export default model<IUserDocument>("User",userSchema)