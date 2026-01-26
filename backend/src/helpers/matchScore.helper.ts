import { IUserDocument } from "../types/user.type";
import { IJobDocument } from "../types/job.type";

export class MatchScoreHelper {
  static computeJobForFreelancer(
    freelancer: IUserDocument,
    job: IJobDocument
  ): number {
    let score = 0;

    // Skill match
    const freelancerSkillIds = this.normalizeSkillIds(freelancer.skills);
    const jobSkillIds = this.normalizeSkillIds(job.skills);
    
    if (freelancerSkillIds.size > 0 && jobSkillIds.size > 0) {
      let matchedCount = 0;

      for (const skillId of jobSkillIds) {
        if (freelancerSkillIds.has(skillId)) {
          matchedCount++;
        }
      }

      const skillScore = (matchedCount / jobSkillIds.size) * 40;
      score += skillScore;
    }

    // Budget match 
    if (
      job.payment?.type === "hourly" &&
      typeof freelancer.hourlyRate === "number" &&
      typeof job.payment.budget === "number"
    ) {
      const diff = Math.abs(freelancer.hourlyRate - job.payment.budget);
      score += diff <= 20 ? 20 : diff <= 50 ? 10 : 0;
    }

    // Location match
    if (
      job.locationPreference?.type === "worldwide" ||
      job.locationPreference?.country === freelancer.location?.country
    ) {
      score += 10;
    }

    // Profile completeness
    if (freelancer.isProfileCompleted) {
      score += 10;
    }

    // Competition penalty −10 and -5
    if (job.proposalCount > 20) score -= 10;
    else if (job.proposalCount > 10) score -= 5;

    return Math.max(0, Math.round(score));
  }

  static computeFreelancerForJob(job: IJobDocument, freelancer: IUserDocument): number {
    return this.computeJobForFreelancer(freelancer, job);
  }

  private static normalizeSkillIds(
    skills: (string | { _id: string})[] | undefined
  ): Set<string> {
    if (!skills || skills.length === 0) return new Set();

    return new Set(
      skills.map(skill => {
        // populated Skill
        if (typeof skill === "object" && skill._id) {
          return skill._id.toString();
        }
        // ObjectId
        return skill.toString();
      })
    );
  }

}
