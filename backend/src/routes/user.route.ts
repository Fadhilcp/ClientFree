import { Router } from "express";
import { ProfileController } from "../controllers/user.controller";
import { UserRepository } from "../repositories/user.repository";
import { UserService } from "../services/user.service";
import { authMiddleware } from "middlewares/authMiddleware";
import { upload } from "middlewares/upload.middleware";
import { verifyUserNotBanned } from "middlewares/verifyUserNotBanned.middleware";


const userRouter = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new ProfileController(userService)

userRouter.use(authMiddleware, verifyUserNotBanned);

userRouter.get('/me',userController.getMe.bind(userController));
userRouter.put('/me',userController.update.bind(userController));
userRouter.get('/freelancers',userController.getFreelancers.bind(userController));
userRouter.get('/',userController.getAll.bind(userController));

userRouter.post('/profile-image',upload.single('profileImage'),
        userController.setProfileImage.bind(userController)
    );
userRouter.delete('/profile-image',userController.removeProfileImage.bind(userController));
userRouter.patch('/:id/status',userController.updateStatus.bind(userController));

userRouter.get('/interested',userController.getInterestedFreelancer.bind(userController));
userRouter.post('/:freelancerId/interest',userController.addFreelancerInterest.bind(userController));
userRouter.delete('/:freelancerId/interest',userController.removeFreelancerInterest.bind(userController));

userRouter.get('/:id',userController.getById.bind(userController));

export default userRouter;