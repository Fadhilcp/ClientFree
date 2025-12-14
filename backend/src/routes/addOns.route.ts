import { AddonController } from "controllers/addOns.controller";
import { AddOnRepository } from "repositories/addOns.repository";
import { AddOnService } from "services/addOns.service";
import { Router } from "express";
import { authMiddleware } from "middlewares/authMiddleware";
import { verifyUserNotBanned } from "middlewares/verifyUserNotBanned.middleware";

const addOnRespository = new AddOnRepository();
const addOnService = new AddOnService(addOnRespository);
const addOnController = new AddonController(addOnService);

const addOnRouter = Router();

addOnRouter.use(authMiddleware);
addOnRouter.use(verifyUserNotBanned);

addOnRouter.post('/',addOnController.create.bind(addOnController));
addOnRouter.put('/:addOnId',addOnController.update.bind(addOnController));
addOnRouter.patch('/:addOnId/toggle',addOnController.toggleActive.bind(addOnController));
addOnRouter.get('/',addOnController.getAll.bind(addOnController));
addOnRouter.get('/:addOnId',addOnController.getById.bind(addOnController));
addOnRouter.delete('/:addOnId',addOnController.delete.bind(addOnController));

export default addOnRouter;