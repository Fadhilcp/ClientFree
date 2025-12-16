import { AddOnDto } from "dtos/addOns.dto";
import { IAddOn, IAddOnDocument } from "types/addOns.type";
import { IAddOnService } from "./interface/IAddOnsService";
import { IAddOnRepository } from "repositories/interfaces/IAddOnsRepository";
import { createHttpError } from "utils/httpError.util";
import { HttpStatus } from "constants/status.constants";
import { HttpResponse } from "constants/responseMessage.constant";
import addOnsMapper from "mappers/addOns.mapper";
import { PaginatedResult } from "types/pagination";
import { FilterQuery } from "mongoose";

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
    
    async getAll(search: string, page: number, limit: number): Promise<PaginatedResult<AddOnDto>> {
        const filter: FilterQuery<IAddOnDocument> = {};
        if(search){
            filter.$or = [
                { key: { $regex: search, $options: "i" } },
                { displayName: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
            ]
        }
        const result = await this._addOnRepository.paginate(filter, { page, limit, sort: { createdAt: -1 } });

        return {
            ...result,
            data: addOnsMapper.toList(result.data)
        }
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

    async getActive(): Promise<AddOnDto[]> {

        const addOns = await this._addOnRepository.find({ isActive: true }, { sort: { sortOrder: 1 }});

        return addOnsMapper.toList(addOns);
    }
}