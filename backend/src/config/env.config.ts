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
    }
}