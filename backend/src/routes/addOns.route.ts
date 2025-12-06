import { AddonController } from "controllers/addOns.controller";
import { AddOnRepository } from "repositories/addOns.repository";
import { AddOnService } from "services/addOns.service";
import { Router } from "express";
import { authMiddleware } from "middlewares/authMiddleware";

const addOnRespository = new AddOnRepository();
const addOnService = new AddOnService(addOnRespository);
const addOnController = new AddonController(addOnService);

const addOnRouter = Router();

addOnRouter.post('/',authMiddleware,addOnController.create.bind(addOnController));
addOnRouter.put('/:addOnId',authMiddleware,addOnController.update.bind(addOnController));
addOnRouter.patch('/:addOnId/toggle',authMiddleware,addOnController.toggleActive.bind(addOnController));
addOnRouter.get('/',authMiddleware,addOnController.getAll.bind(addOnController));
addOnRouter.get('/:addOnId',authMiddleware,addOnController.getById.bind(addOnController));
addOnRouter.delete('/:addOnId',authMiddleware,addOnController.delete.bind(addOnController));

export default addOnRouter;