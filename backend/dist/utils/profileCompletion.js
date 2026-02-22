"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFreelancerProfileCompleted = isFreelancerProfileCompleted;
exports.isClientProfileCompleted = isClientProfileCompleted;
exports.calculateProfileCompletion = calculateProfileCompletion;
function isFreelancerProfileCompleted(user) {
    return Boolean(user.name &&
        user.phone &&
        user.skills?.length &&
        user.professionalTitle &&
        user.experienceLevel &&
        user.location?.country);
}
function isClientProfileCompleted(user) {
    return Boolean(user.name &&
        user.phone &&
        user.company?.name &&
        user.location?.country);
}
function calculateProfileCompletion(user) {
    return user.role === "freelancer"
        ? isFreelancerProfileCompleted(user)
        : isClientProfileCompleted(user);
}
