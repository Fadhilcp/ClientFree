import { IAddOnDocument } from "../types/addOns.type";
import { AddOnDto } from "../dtos/addOns.dto";

class AddOnMapper {
  toMap(addOn: IAddOnDocument): AddOnDto {
    return {
      id: addOn._id.toString(),
      key: addOn.key,
      displayName: addOn.displayName,
      description: addOn.description,

      category: addOn.category,
      price: addOn.price,
      userType: addOn.userType,

      flags: {
        highlight: addOn.flags.highlight ?? false,
        sealed: addOn.flags.sealed ?? false,
        sponsored: addOn.flags.sponsored ?? false,
      },

      sortOrder: addOn.sortOrder,
      isActive: addOn.isActive,

      createdAt: addOn.createdAt!,
      updatedAt: addOn.updatedAt!
    };
  }

  toList(items: IAddOnDocument[]): AddOnDto[] {
    return items.map((item) => this.toMap(item));
  }
}

export default new AddOnMapper();