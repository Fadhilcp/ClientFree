import { UserListingDto } from "dtos/userListing.dto";

export function mapUserToListingDto(user: any): UserListingDto {
  return {
    id: user._id.toString(),
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    profileImage: user.profileImage,
    location: user.location,
    isVerified: user.isVerfied, 
    isPremium: user.isPremium,
    createdAt: user.createdAt,
    experienceLevel: user.experienceLevel,
    professionalTitle: user.professionalTitle,
    hourlyRate: user.hourlyRate,
    company: user.company,
  };
}