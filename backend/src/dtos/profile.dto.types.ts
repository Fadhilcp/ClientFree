import { ClientProfileDto } from "./clientProfile.dto";
import { FreelancerProfileDto } from "./freelancerProfile.dto";
import { UserListingDto } from "./userListing.dto";

export type UserProfileDto = FreelancerProfileDto | ClientProfileDto | UserListingDto;