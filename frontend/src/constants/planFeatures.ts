export type FeatureKey =
  | 'VerifiedBadge'
  | 'PremiumSupport'
  | 'BestMatch'
  | 'HigherJobVisibility'
  | 'UnlimitedInvites'
  | 'DirectMessaging'
  | 'AIProposalShortlisting'
  | 'HigherProfileVisibility'
  | 'UnlimitedProposals'
  | 'PriorityNotifications';

export const commonFeatures: FeatureKey[] = [
  'VerifiedBadge',
  'PremiumSupport',
  'BestMatch',
];

export const clientFeatures: FeatureKey[] = [
  'HigherJobVisibility',
  'UnlimitedInvites',
  'DirectMessaging',
  'AIProposalShortlisting',
];

export const freelancerFeatures: FeatureKey[] = [
  'HigherProfileVisibility',
  'UnlimitedProposals',
  'PriorityNotifications',
];