import { FreelancerProfileDto } from "dtos/freelancerProfile.dto";

export function mapUserToFreelancerDto(user: any): FreelancerProfileDto {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    name: user.name,
    role: user.role,
    professionalTitle: user.professionalTitle,
    hourlyRate: user.hourlyRate,
    experienceLevel: user.experienceLevel,
    about: user.about,
    description: user.description,
    skills: user.skills ?? [],
    externalLinks: user.externalLinks ?? [],
    portfolio: user.portfolio ?? {},

    stats: {
      jobsCompleted: user.stats?.jobsCompleted ?? 0,
      reviewsCount: user.stats?.reviewsCount ?? 0,
      earningTotal: user.stats?.earningTotal ?? 0
    },

    ratings: {
      asFreelancer: user.ratings?.asFreelancer ?? 0
    },

    location: user.location,
    createdAt: user.createdAt
  };
}