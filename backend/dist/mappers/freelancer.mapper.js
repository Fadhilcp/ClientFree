"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapUserToFreelancerDto = mapUserToFreelancerDto;
exports.mapUserToFreelancerListItemDto = mapUserToFreelancerListItemDto;
function mapUserToFreelancerDto(user) {
    return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        profileImage: user.profileImage || '',
        name: user.name,
        role: user.role,
        status: user.status,
        phone: user.phone,
        professionalTitle: user.professionalTitle,
        hourlyRate: user.hourlyRate,
        experienceLevel: user.experienceLevel,
        about: user.about,
        description: user.description,
        skills: user.skills ?? [],
        externalLinks: user.externalLinks ?? [],
        portfolio: user.portfolio?.map(p => ({
            title: p.title,
            link: p.link,
            file: p.file,
            createdAt: p.createdAt,
        })) ?? [],
        resume: user.resume
            ? {
                fileUrl: user.resumeSignedUrl,
                uploadedAt: user.resume.uploadedAt,
            }
            : undefined,
        education: user.education?.map(e => ({
            degree: e.degree,
            institution: e.institution,
            startYear: e.startYear,
            endYear: e.endYear,
        })) ?? [],
        isProfileComplete: user.isProfileCompleted ?? false,
        isVerified: user.isVerified ?? false,
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
function mapUserToFreelancerListItemDto(user) {
    return {
        id: user._id.toString(),
        username: user.username ?? "",
        name: user.name ?? "",
        email: user.email ?? "",
        skills: user.skills ?? [],
        about: user.about ?? "",
        experienceLevel: user.experienceLevel ?? "",
        ratings: user.ratings?.asFreelancer ?? 0,
        professionalTitle: user.professionalTitle ?? "",
        status: user.status ?? "",
        profileImage: user.profileImage ?? "",
        isVerified: user.isVerified ?? false,
    };
}
