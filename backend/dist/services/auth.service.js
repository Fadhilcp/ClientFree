"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const generateOtp_1 = require("../utils/generateOtp");
const bcrypt_1 = __importDefault(require("bcrypt"));
const mailer_util_1 = require("../utils/mailer.util");
const jwt_util_1 = require("../utils/jwt.util");
const status_constants_1 = require("../constants/status.constants");
const responseMessage_constant_1 = require("../constants/responseMessage.constant");
const httpError_util_1 = require("../utils/httpError.util");
const axios_1 = __importDefault(require("axios"));
const mapUserProfile_1 = require("../mappers/mapUserProfile");
class AuthService {
    constructor(_userRepository, _otpUserStoreRepository, _walletRepository, _subscriptionService) {
        this._userRepository = _userRepository;
        this._otpUserStoreRepository = _otpUserStoreRepository;
        this._walletRepository = _walletRepository;
        this._subscriptionService = _subscriptionService;
    }
    ;
    async signUp(userData) {
        if (!userData.email) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.EMAIL_REQUIRED);
        }
        const existingUser = await this._userRepository.findByEmail(userData.email);
        const pendingUser = await this._otpUserStoreRepository.findByEmail(userData.email);
        if (existingUser) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CONFLICT, responseMessage_constant_1.HttpResponse.EMAIL_EXIST);
        }
        const otp = (0, generateOtp_1.generateOtp)();
        if (pendingUser) {
            await this._otpUserStoreRepository.updateOne({ email: userData.email }, { otp, expiresAt: new Date(Date.now() + 1 * 60 * 1000) });
            await (0, mailer_util_1.sendOtpEmail)(userData.email, otp);
            return;
        }
        if (!userData.password)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.PASSWORD_REQUIRED);
        const hashPassword = await bcrypt_1.default.hash(userData.password, 10);
        await this._otpUserStoreRepository.create({
            username: userData.username,
            email: userData.email,
            password: hashPassword,
            role: userData.role,
            otp,
            expiresAt: new Date(Date.now() + 1 * 60 * 1000),
            purpose: 'signup'
        });
        await (0, mailer_util_1.sendOtpEmail)(userData.email, otp);
    }
    async verifySignupOtp(email, otp, purpose) {
        const pendingUser = await this._otpUserStoreRepository.findByEmailAndOtp(email, otp);
        if (!pendingUser || pendingUser.purpose !== purpose)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.OTP_INCORRECT);
        if (pendingUser.expiresAt < new Date())
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.OTP_EXPIRED);
        // create user and wallet with db transaction
        const { createdUser } = await this._createUserWithWallet({
            username: pendingUser.username,
            email: pendingUser.email,
            password: pendingUser.password,
            role: pendingUser.role,
            provider: "local",
        });
        await this._otpUserStoreRepository.delete(pendingUser._id);
        const payload = {
            _id: createdUser._id.toString(),
            email: createdUser.email,
            role: createdUser.role,
        };
        const accessToken = (0, jwt_util_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_util_1.generateRefreshToken)(payload);
        const user = (0, mapUserProfile_1.mapUserProfile)(createdUser);
        return { user, accessToken, refreshToken };
    }
    async _createUserWithWallet(pendingUser) {
        const createdUser = await this._userRepository.create({
            username: pendingUser.username,
            email: pendingUser.email,
            password: pendingUser.password,
            role: pendingUser.role,
            provider: pendingUser.provider,
        });
        let wallet;
        try {
            wallet = await this._walletRepository.create({
                userId: createdUser._id,
                role: createdUser.role,
                balance: { available: 0, escrow: 0, pending: 0 },
                currency: "INR",
                status: "active",
            });
        }
        catch {
            // Wallet creation failed — delete the user to avoid inconsistent state
            await this._userRepository.delete(createdUser._id.toString());
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR, "Wallet creation failed");
        }
        return { createdUser, wallet };
    }
    async forgotPassword(email) {
        const user = await this._userRepository.findOne({ email });
        if (!user)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        const otp = (0, generateOtp_1.generateOtp)();
        const expiresAt = new Date(Date.now() + 1 * 60 * 1000);
        const existingRecord = await this._otpUserStoreRepository.findOne({
            email,
            purpose: 'forgot-password',
        });
        if (existingRecord) {
            await this._otpUserStoreRepository.updateOne({ email, purpose: 'forgot-password' }, {
                otp,
                isVerified: false,
                verifiedAt: null,
                expiresAt,
            });
        }
        else {
            await this._otpUserStoreRepository.create({
                email,
                purpose: 'forgot-password',
                otp,
                expiresAt,
            });
        }
        await (0, mailer_util_1.sendOtpEmail)(email, otp, 'Forgot Password');
    }
    async accessRefreshToken(token) {
        if (!token) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.NO_TOKEN);
        }
        const decoded = (0, jwt_util_1.verifyRefreshToken)(token);
        const userId = decoded._id;
        if (!userId) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.NO_PAYLOAD);
        }
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        }
        if (user.status === "banned") {
            throw (0, httpError_util_1.createHttpError)(403, "User is banned");
        }
        const payload = {
            _id: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const accessToken = (0, jwt_util_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_util_1.generateRefreshToken)(payload);
        return { accessToken, newRefreshToken: refreshToken };
    }
    async login(email, password) {
        const user = await this._userRepository.findByEmail(email);
        if (!user)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        if (user.status === 'banned') {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.FORBIDDEN, "User is banned");
        }
        if (!user.password || user.provider === 'google') {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, "Password login not allowed for Google account");
        }
        const passwordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.PASSWORD_INCORRECT);
        user.lastLoginAt = new Date();
        await user.save();
        const payload = {
            _id: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const subscription = await this._subscriptionService.getActiveFeatures(user._id.toString());
        const accessToken = (0, jwt_util_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_util_1.generateRefreshToken)(payload);
        const mappedUser = (0, mapUserProfile_1.mapUserProfile)(user);
        return { accessToken, refreshToken, user: mappedUser, subscription };
    }
    async resendOtp(email, purpose) {
        const [user, pendingUser] = await Promise.all([
            this._userRepository.findOne({ email }),
            this._otpUserStoreRepository.findOne({ email, purpose })
        ]);
        if (purpose === 'signup' && user) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.CONFLICT, responseMessage_constant_1.HttpResponse.USER_EXIST);
        }
        if (purpose === 'forgot-password' && !user) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        }
        if (!pendingUser)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.OTP_NOT_FOUND);
        const otp = (0, generateOtp_1.generateOtp)();
        const expiresAt = new Date(Date.now() + 1 * 60 * 1000);
        await this._otpUserStoreRepository.updateOne({ email, purpose }, { otp, expiresAt });
        await (0, mailer_util_1.sendOtpEmail)(email, otp, purpose);
    }
    async verifyOtp(email, otp, purpose) {
        const record = await this._otpUserStoreRepository.findOne({ email, purpose });
        if (!record || record.otp !== otp) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.OTP_INCORRECT);
        }
        const now = new Date();
        if (record.expiresAt < now) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.TOKEN_EXPIRED);
        }
        switch (purpose) {
            case 'email-change':
                if (!record.newEmail)
                    throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.EMAIL_REQUIRED);
                await this._userRepository.updateOne({ email }, { email: record.newEmail });
                await this._otpUserStoreRepository.deleteOne({ email, purpose });
                break;
            case 'phone-change':
                if (!record.newPhone)
                    throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.PHONE_REQUIRED);
                await this._userRepository.updateOne({ email }, { phone: record.newPhone });
                await this._otpUserStoreRepository.deleteOne({ email, purpose });
                break;
            case 'forgot-password':
                //verifiedAt is to check the validity time of when reset password
                await this._otpUserStoreRepository.updateOne({ email, purpose: 'forgot-password' }, { isVerified: true, verifiedAt: new Date() });
                break;
            default:
                (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.UNEXPECTED_KEY_FOUND);
        }
    }
    async resetPassword(email, newPassword) {
        const [user, otpRecord] = await Promise.all([
            this._userRepository.findOne({ email }),
            this._otpUserStoreRepository.findOne({ email, isVerified: true })
        ]);
        if (!user)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        if (!otpRecord)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.OTP_VERIFICATION_REQUIRED);
        const now = new Date();
        const maxWindow = 5 * 60 * 1000;
        if (!otpRecord.verifiedAt || now.getTime() - otpRecord.verifiedAt.getTime() > maxWindow) {
            await this._otpUserStoreRepository.deleteOne({ email, purpose: 'forgot-password' });
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.UNAUTHORIZED, responseMessage_constant_1.HttpResponse.PASSWORD_RESET_EXPIRED);
        }
        const hashPassword = await bcrypt_1.default.hash(newPassword, 10);
        await this._userRepository.updateOne({ email }, { password: hashPassword });
        await this._otpUserStoreRepository.deleteOne({ email, purpose: 'forgot-password' });
    }
    async googleAuth(access_token, role) {
        try {
            const { data } = await axios_1.default.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            const { email, name } = data;
            if (!email)
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.EMAIL_REQUIRED);
            let user = await this._userRepository.findOne({ email });
            //to identify user is new or not
            let isNewUser = false;
            if (!user) {
                if (!role)
                    return { needsRole: true };
                const { createdUser } = await this._createUserWithWallet({
                    username: name,
                    email,
                    password: undefined,
                    role,
                    provider: 'google'
                });
                user = createdUser;
                isNewUser = true;
            }
            const payload = {
                _id: user._id.toString(),
                email: user.email,
                role: user.role,
            };
            const refreshToken = (0, jwt_util_1.generateRefreshToken)(payload);
            const accessToken = (0, jwt_util_1.generateAccessToken)(payload);
            const sanitizedUser = {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            };
            return { user: sanitizedUser, refreshToken, accessToken, isNewUser };
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('googleAuth service error', error.message);
                throw error;
            }
            else {
                throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.INTERNAL_SERVER_ERROR, 'An unexpected error occurred');
            }
        }
    }
    async getNewAccessToken(refreshToken) {
        const decoded = (0, jwt_util_1.verifyRefreshToken)(refreshToken);
        const userId = decoded._id;
        if (!userId) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.NO_PAYLOAD);
        }
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        }
        if (user.status === "banned") {
            throw (0, httpError_util_1.createHttpError)(403, "User is banned");
        }
        const payload = {
            _id: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const accessToken = (0, jwt_util_1.generateAccessToken)(payload);
        const subscription = await this._subscriptionService.getActiveFeatures(user._id.toString());
        return { user: (0, mapUserProfile_1.mapUserProfile)(user), accessToken, subscription };
    }
    async changePassword(userId, password, newPassword) {
        const user = await this._userRepository.findById(userId);
        if (!user)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        if (user.provider === 'google' && !user.password) {
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, `You can't change password because you are a google auth user`);
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.BAD_REQUEST, responseMessage_constant_1.HttpResponse.PASSWORD_INCORRECT);
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        const updateUser = await this._userRepository.findByIdAndUpdate(userId, { password: hashedPassword });
        if (!updateUser)
            throw (0, httpError_util_1.createHttpError)(status_constants_1.HttpStatus.NOT_FOUND, responseMessage_constant_1.HttpResponse.USER_NOT_FOUND);
        return { message: 'Password updated successfully' };
    }
}
exports.AuthService = AuthService;
