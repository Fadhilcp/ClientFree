"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapUserToSelect = void 0;
exports.mapUserToListingDto = mapUserToListingDto;
function mapUserToListingDto(user) {
    return {
        id: user._id.toString(),
        username: user.username,
        name: user.name ?? "",
        email: user.email,
        role: user.role,
        status: user.status,
        profileImage: user.profileImage,
        lastLoginAt: user.lastLoginAt,
        isVerified: user.isVerified,
        subscription: user.subscription,
        createdAt: user.createdAt
    };
}
// for searchable listing
const mapUserToSelect = (user) => {
    return {
        id: user._id.toString(),
        label: `${user.username} (${user.email})`,
    };
};
exports.mapUserToSelect = mapUserToSelect;
