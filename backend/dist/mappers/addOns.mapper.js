"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AddOnMapper {
    toMap(addOn) {
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
            createdAt: addOn.createdAt,
            updatedAt: addOn.updatedAt
        };
    }
    toList(items) {
        return items.map((item) => this.toMap(item));
    }
}
exports.default = new AddOnMapper();
