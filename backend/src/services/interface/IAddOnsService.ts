import { AddOnDto } from "dtos/addOns.dto";
import { IAddOn } from "types/addOns.type";

export interface IAddOnService {
    createAddOn(addOnData: IAddOn): Promise<AddOnDto>;
    updateAddOn(addOnId: string, addOnData: Partial<IAddOn>): Promise<AddOnDto>;
    toggleActive(addOnId: string): Promise<AddOnDto>;
    getAll(): Promise<AddOnDto[]>;
    getById(addOnId: string): Promise<AddOnDto>;
    deleteAddOn(addOnId: string): Promise<boolean>;
}