import { Router } from "express";
import { ProfileController } from "../controllers/user.controller";
import { UserRepository } from "../repositories/user.repository";
import { UserService } from "../services/user.service";
import { authMiddleware } from "middlewares/authMiddleware";
import { upload } from "middlewares/upload.middleware";


const userRouter = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new ProfileController(userService)

userRouter.get('/me',authMiddleware,userController.getMe.bind(userController));
userRouter.put('/me',authMiddleware,userController.update.bind(userController));
userRouter.get('/freelancers',authMiddleware,userController.getFreelancers.bind(userController));
userRouter.get('/',userController.getAll.bind(userController));

userRouter.post('/profile-image',authMiddleware,upload.single('profileImage'),
        userController.setProfileImage.bind(userController)
    );
userRouter.delete('/profile-image',authMiddleware,userController.removeProfileImage.bind(userController));
userRouter.patch('/:id/status',authMiddleware,userController.updateStatus.bind(userController));

userRouter.get('/interested',authMiddleware,userController.getInterestedFreelancer.bind(userController));
userRouter.post('/:freelancerId/interest',authMiddleware,userController.addFreelancerInterest.bind(userController));
userRouter.delete('/:freelancerId/interest',authMiddleware,userController.removeFreelancerInterest.bind(userController));

userRouter.get('/:id',authMiddleware,userController.getById.bind(userController));

export default userRouter;