import { mapUserToFreelancerDto } from "./freelancer.mapper";
import { mapUserToClientDto } from "./client.mapper";
import { mapUserToListingDto } from "./userListing.mapper";

export function mapUserProfile(user: any) {
  switch (user.role) {
    case "freelancer":
      return mapUserToFreelancerDto(user);

    case "client":
      return mapUserToClientDto(user);

    case "admin":
      return mapUserToListingDto(user);

    default:
      return mapUserToListingDto(user);
  }
}