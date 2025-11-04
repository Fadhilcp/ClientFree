import type { ClientProfileDto } from "./clientProfile.dto";
import type { FreelancerProfileDto } from "./freelancerProfile.dto";
import type { UserListingDto } from "./userListing.dto";

export type UserProfileDto = FreelancerProfileDto | ClientProfileDto | UserListingDto;