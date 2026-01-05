import { AddOnDto } from "../../dtos/addOns.dto";
import { IAddOn } from "../../types/addOns.type";
import { PaginatedResult } from "../../types/pagination";

export interface IAddOnService {
    createAddOn(addOnData: IAddOn): Promise<AddOnDto>;
    updateAddOn(addOnId: string, addOnData: Partial<IAddOn>): Promise<AddOnDto>;
    toggleActive(addOnId: string): Promise<AddOnDto>;
    getAll(search: string, page: number, limit: number): Promise<PaginatedResult<AddOnDto>>;
    getById(addOnId: string): Promise<AddOnDto>;
    deleteAddOn(addOnId: string): Promise<boolean>;
    getActive(): Promise<AddOnDto[]>;
}