import { ClientProfileDto } from "dtos/clientProfile.dto";
import { IUserDocument } from "types/user.type";

export function mapUserToClientDto(user: IUserDocument): ClientProfileDto {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    profileImage: user.profileImage || '',
    name: user.name,
    role: user.role,
    status: user.status,
    phone: user.phone,
    company: user.company ?? {},
    description: user.description,

    stats: {
      totalProjectsPosted: user.stats?.totalProjectsPosted ?? 0,
      totalSpent: user.stats?.totalSpent ?? 0
    },

    ratings: {
      asClient: user.ratings?.asClient ?? 0
    },

    location: user.location,
    createdAt: user.createdAt
  };
}