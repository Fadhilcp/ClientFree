import dotenv from 'dotenv'
dotenv.config()

export const env = {

    get MONGO_DB(){
        return process.env.MONGO_DB;
    },

    get PORT(){
        return process.env.PORT;
    },

    //cors
    get CORS_ORIGIN(){
        return process.env.CORS_ORIGIN;
    },
    get CORS_METHODS(){
        return process.env.CORS_METHODS;
    },
    get CORS_ALLOWED_HEADERS(){
        return process.env.CORS_ALLOWED_HEADERS;
    },
    get CORS_CREDENTIALS(){
        return process.env.CORS_CREDENTIALS;
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
    // aws
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
    },
    // redis 
    get REDIS_PASSWORD() {
        return process.env.REDIS_PASSWORD
    },
    
    get REDIS_PORT() {
        return process.env.REDIS_PORT
    },

    get REDIS_HOST() {
        return process.env.REDIS_HOST
    },
    // loggest retention 
    get LOG_RETENTION_DAYS() {
        return process.env.LOG_RETENTION_DAYS
    },

    get LOG_MAX_FILE_SIZE() {
        return process.env.LOG_MAX_FILE_SIZE
    },

    get LOG_DIR() {
        return process.env.LOG_DIR
    },

    get LOG_LEVEL() {
        return process.env.LOG_LEVEL
    },

    get AWS_SIGNED_URL_EXPIRES_IN() {
        return process.env.AWS_SIGNED_URL_EXPIRES_IN
    },
    // stripe
    get STRIPE_SECRET_KEY(){
        return process.env.STRIPE_SECRET_KEY;
    },
    get STRIPE_PUBLISHABLE_KEY(){
        return process.env.STRIPE_PUBLISHABLE_KEY;
    },
    get FRONTEND_URL(){
        return process.env.FRONTEND_URL;
    },
    get STRIPE_WEBHOOK_SECRET(){
        return process.env.STRIPE_WEBHOOK_SECRET;
    }
}