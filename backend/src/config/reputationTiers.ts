// Mirrors context/ReputationContext.tsx's REPUTATION_TIERS on the frontend.
// Kept as plain data/functions (not a model) since reputation is derived,
// not stored — same design decision as the frontend.

export interface ReputationTier {
  name: string;
  minScore: number;
  perkDescription: string;
}

export const REPUTATION_TIERS: ReputationTier[] = [
  { name: "Newcomer", minScore: 0, perkDescription: "Full access to Jobs, Teaching Hub, and Voice Hub." },
  { name: "Trusted Citizen", minScore: 500, perkDescription: "Small ranking boost in Opportunity Engine matches." },
  { name: "Verified Professional", minScore: 600, perkDescription: "Qualifies to become a Teaching Hub Master even without 20 completed jobs yet." },
  { name: "Civic Leader", minScore: 700, perkDescription: "Featured badge shown on Talent and Opportunity listings." },
  { name: "State Honoree", minScore: 850, perkDescription: "Eligible for Innovation Engine judging panels and state recognition." },
];

export function getTierForScore(score: number): ReputationTier {
  let current = REPUTATION_TIERS[0];
  for (const tier of REPUTATION_TIERS) {
    if (score >= tier.minScore) current = tier;
  }
  return current;
}

export function getNextTier(score: number): ReputationTier | null {
  const sorted = [...REPUTATION_TIERS].sort((a, b) => a.minScore - b.minScore);
  return sorted.find((t) => t.minScore > score) ?? null;
}

export const VERIFIED_PROFESSIONAL_SCORE =
  REPUTATION_TIERS.find((t) => t.name === "Verified Professional")?.minScore ?? 600;
export const STATE_HONOREE_SCORE =
  REPUTATION_TIERS.find((t) => t.name === "State Honoree")?.minScore ?? 850;
