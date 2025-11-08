import { IUser } from "../types/user.type";

export function isFreelancerProfileCompleted(user: IUser) {
  return Boolean(
    user.name &&
    user.phone &&
    user.skills?.length &&
    user.professionalTitle &&
    user.experienceLevel &&
    user.location?.country
  );
}

export function isClientProfileCompleted(user: IUser) {
  return Boolean(
    user.name &&
    user.phone &&
    user.company?.name &&
    user.location?.country
  );
}

export function calculateProfileCompletion(user: IUser): boolean {
  return user.role === "freelancer"
    ? isFreelancerProfileCompleted(user)
    : isClientProfileCompleted(user);
}