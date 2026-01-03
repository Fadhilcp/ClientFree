import { UserListingDto } from "dtos/userListing.dto";
import { IUserDocument } from "types/user.type";

export function mapUserToListingDto(user: IUserDocument): UserListingDto {
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