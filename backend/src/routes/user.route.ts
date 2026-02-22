import { Router } from "express";
import { ProfileController } from "../controllers/user.controller";
import { UserRepository } from "../repositories/user.repository";
import { UserService } from "../services/user.service";
import { authMiddleware } from "../middlewares/authMiddleware";
import { profileUpload } from "../middlewares/profileUpload.middleware";
import { verifyUserNotBanned } from "../middlewares/verifyUserNotBanned.middleware";
import { authorizeRole } from "../middlewares/authorizeRole";
import { UserRole } from "../constants/user.constants";
import upload from "../utils/uploader-s3.util";

const userRouter = Router();

const userRepository = new UserRepository();

const userService = new UserService(userRepository);
const userController = new ProfileController(userService)

userRouter.use(authMiddleware, verifyUserNotBanned);

userRouter.get('/me',userController.getMe.bind(userController));
userRouter.put('/me',userController.update.bind(userController));
userRouter.get('/freelancers',userController.getFreelancers.bind(userController));
userRouter.get('/',userController.getAll.bind(userController));

userRouter.get('/search',authorizeRole(UserRole.ADMIN),userController.searchUsers.bind(userController));
userRouter.get('/by-ids',authorizeRole(UserRole.ADMIN),userController.getUsersByIds.bind(userController));

userRouter.post('/profile-image',profileUpload.single('profileImage'),
        userController.setProfileImage.bind(userController)
    );
userRouter.delete('/profile-image',userController.removeProfileImage.bind(userController));

userRouter.post('/resume',upload.single("resume"),userController.uploadResume.bind(userController));

userRouter.patch('/:id/status',userController.updateStatus.bind(userController));

userRouter.get('/interested',userController.getInterestedFreelancer.bind(userController));
userRouter.post('/:freelancerId/interest',userController.addFreelancerInterest.bind(userController));
userRouter.delete('/:freelancerId/interest',userController.removeFreelancerInterest.bind(userController));

userRouter.get('/:id',userController.getById.bind(userController));

export default userRouter;