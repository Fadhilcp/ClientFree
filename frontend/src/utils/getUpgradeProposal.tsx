import { type IProposal } from "../types/job/proposal.type";

interface GetUpgradeProposalParams {
  proposal: IProposal;
  userId?: string;
  isJobOwner: boolean;
}

export const getUpgradeProposal = ({
  proposal,
  userId,
  isJobOwner,
}: GetUpgradeProposalParams) => {
  const upgrade = proposal.optionalUpgrade?.name;
  const isProposalOwner = userId === proposal.freelancer.id;

  switch (upgrade) {
    case "sealed":
      if (!isJobOwner && !isProposalOwner) {
        return {
          title: undefined,
          description: undefined,
          meta: undefined,
          subtitle: undefined,
          extraContent: (
            <span className="mt-5 mr-3 float-start text-xs font-bold text-indigo-400">
              SEALED
            </span>
          ),
        };
      }

      return {
        extraContent: (
          <span className="mt-5 mr-3 float-start text-xs font-bold text-indigo-400">
            SEALED
          </span>
        ),
      };

    case "highlight":
      if (!isJobOwner) {
        return {
          extraContent: (
            <span className="mt-5 mr-3 float-start text-xs font-bold text-red-500">
              HIGHLIGHT
            </span>
          ),
        };
      }

      return {
        className: `
          border-2 border-indigo-400 dark:border-indigo-400
          from-gray-50 via-indigo-200 to-gray-50 
          dark:from-gray-800 dark:via-indigo-900 dark:to-gray-800
          shadow-md
        `,
      };

    case "sponsored":
      return {
        className: "ring-1 ring-yellow-500 shadow-xl",
        extraContent: (
          <span className="mt-5 mr-3 float-start text-xs font-bold text-yellow-500">
            SPONSORED
          </span>
        ),
      };

    default:
      return {};
  }
};
