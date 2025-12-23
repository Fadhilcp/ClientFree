import dotenv from 'dotenv'
dotenv.config()

export const env = {

    get MONGO_DB(){
        return process.env.MONGO_DB;
    },

    get PORT(){
        return process.env.PORT;
    },

    get SENDER_EMAIL(){
        return process.env.SENDER_EMAIL;
    },

    get PASSKEY(){
        return process.env.PASSKEY;
    },

    get ACCESS_SECRET(){
        return process.env.JWT_ACCESS_SECRET
    },

    get REFRESH_SECRET(){
        return process.env.JWT_ACCESS_SECRET
    },

    get PAYPAL_CLIENT_ID(){
        return process.env.PAYPAL_CLIENT_ID
    },

    get PAYPAL_SECRET(){
        return process.env.PAYPAL_SECRET
    },

    get RAZORPAY_KEY_ID(){
        return process.env.RAZORPAY_KEY_ID
    },

    get RAZORPAY_SECRET(){
        return process.env.RAZORPAY_SECRET
    },

    get CLOUDINARY_CLOUD_NAME(){
        return process.env.CLOUDINARY_CLOUD_NAME
    },

    get CLOUDINARY_API_KEY(){
        return process.env.CLOUDINARY_API_KEY
    },

    get CLOUDINARY_API_SECRET(){
        return process.env.CLOUDINARY_API_SECRET
    },

    get AWS_ACCESS_KEY(){
        return process.env.AWS_ACCESS_KEY_ID
    },
    
    get AWS_SECRET_ACCESS_KEY(){
        return process.env.AWS_SECRET_ACCESS_KEY
    },

    get AWS_REGION(){
        return process.env.AWS_REGION
    },

    get AWS_BUCKET() {
        return process.env.AWS_BUCKET_NAME
    },

    get OPENAI_API_KEY() {
        return process.env.OPENAI_API_KEY
    }
}