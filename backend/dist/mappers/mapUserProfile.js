"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapUserProfile = mapUserProfile;
const freelancer_mapper_1 = require("./freelancer.mapper");
const client_mapper_1 = require("./client.mapper");
const userListing_mapper_1 = require("./userListing.mapper");
function mapUserProfile(user) {
    switch (user.role) {
        case "freelancer":
            return (0, freelancer_mapper_1.mapUserToFreelancerDto)(user);
        case "client":
            return (0, client_mapper_1.mapUserToClientDto)(user);
        case "admin":
            return (0, userListing_mapper_1.mapUserToListingDto)(user);
        default:
            return (0, userListing_mapper_1.mapUserToListingDto)(user);
    }
}
