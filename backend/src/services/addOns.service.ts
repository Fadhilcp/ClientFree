import { AddOnDto } from "dtos/addOns.dto";
import { IAddOn } from "types/addOns.type";
import { IAddOnService } from "./interface/IAddOnsService";
import { IAddOnRepository } from "repositories/interfaces/IAddOnsRepository";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { HttpResponse } from "constants/responseMessage.constant";
import addOnsMapper from "mappers/addOns.mapper";

export class AddOnService implements IAddOnService {
    constructor(private _addOnRepository: IAddOnRepository){}

    async createAddOn(addOnData: IAddOn): Promise<AddOnDto> {
        const exists = await this._addOnRepository.findOne({ Key: addOnData.key });
        if(exists) throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.ADD_ON_KEY_EXISTS);

        const newAddOn = await this._addOnRepository.create(addOnData);

        return addOnsMapper.toMap(newAddOn);
    }

    async updateAddOn(addOnId: string, addOnData: Partial<IAddOn>): Promise<AddOnDto> {
        const addOn = await this._addOnRepository.findByIdAndUpdate(addOnId, addOnData);
        if(!addOn) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.ADD_ON_NOT_FOUND);

        return addOnsMapper.toMap(addOn);
    }

    async toggleActive(addOnId: string): Promise<AddOnDto> {
        const addOn = await this._addOnRepository.findById(addOnId);
        if(!addOn) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.ADD_ON_NOT_FOUND);

        addOn.isActive = !addOn.isActive;
        addOn.updatedAt = new Date();

        addOn.save();

        return addOnsMapper.toMap(addOn);
    }
    
    async getAll(): Promise<AddOnDto[]> {
        const addOns = await this._addOnRepository.find({});
        return addOnsMapper.toList(addOns);
    }

    async getById(addOnId: string): Promise<AddOnDto> {
        const addOn = await this._addOnRepository.findById(addOnId);
        if(!addOn) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.ADD_ON_NOT_FOUND)

        return addOnsMapper.toMap(addOn);
    }

    async deleteAddOn(addOnId: string): Promise<boolean> {
        const result = await this._addOnRepository.deleteOne({ _id: addOnId });
        return result ? true : false;
    }
}