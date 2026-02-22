"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapUserToClientDto = mapUserToClientDto;
exports.toClientPublic = toClientPublic;
function mapUserToClientDto(user) {
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
        isProfileComplete: user.isProfileCompleted ?? false,
        isVerified: user.isVerified ?? false,
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
function toClientPublic(dto) {
    return {
        id: dto.id,
        username: dto.username,
        name: dto.name ?? dto.username,
        email: dto.email,
        profileImage: dto.profileImage,
        description: dto.description,
        isVerified: dto.isVerified,
        location: dto.location,
        company: dto.company
    };
}
