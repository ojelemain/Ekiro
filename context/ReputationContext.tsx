"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/apiClient";
import { useIdentity } from "@/context/IdentityContext";

export interface ReputationTier {
  name: string;
  minScore: number;
  perkDescription: string;
}

// Pure data — importable anywhere (including other contexts) without needing
// the ReputationProvider in the tree. Must match backend/src/config/reputationTiers.ts
// exactly, since the backend is now the source of truth for tier computation.
export const REPUTATION_TIERS: ReputationTier[] = [
  { name: "Newcomer", minScore: 0, perkDescription: "Full access to Jobs, Teaching Hub, and Voice Hub." },
  { name: "Trusted Citizen", minScore: 500, perkDescription: "Small ranking boost in Opportunity Engine matches." },
  {
    name: "Verified Professional",
    minScore: 600,
    perkDescription: "Qualifies to become a Teaching Hub Master even without 20 completed jobs yet.",
  },
  { name: "Civic Leader", minScore: 700, perkDescription: "Featured badge shown on Talent and Opportunity listings." },
  {
    name: "State Honoree",
    minScore: 850,
    perkDescription: "Eligible for future Innovation Engine judging panels and state recognition.",
  },
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

export interface Badge {
  id: string;
  label: string;
  description: string;
  earned: boolean;
}

interface ReputationContextValue {
  civicScore: number;
  currentTier: ReputationTier;
  nextTier: ReputationTier | null;
  progressPercent: number;
  badges: Badge[];
  isLoading: boolean;
  refreshReputation: () => Promise<void>;
}

const ReputationContext = createContext<ReputationContextValue | undefined>(undefined);

const DEFAULT_TIER = REPUTATION_TIERS[0];

export function ReputationProvider({ children }: { children: React.ReactNode }) {
  const { identityId, isVerified } = useIdentity();

  const [civicScore, setCivicScore] = useState(0);
  const [currentTier, setCurrentTier] = useState<ReputationTier>(DEFAULT_TIER);
  const [nextTier, setNextTier] = useState<ReputationTier | null>(REPUTATION_TIERS[1] ?? null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reputation is computed entirely server-side (backend/src/controllers/
  // reputationController.ts), reading Wallet, Worker/Booking, Master,
  // TalentProfile, and Contribution collections directly — this context is
  // just a thin fetch layer over that, not a re-derivation.
  const refreshReputation = useCallback(async () => {
    if (!identityId || !isVerified) return;
    setIsLoading(true);
    try {
      const data = await api.get<{
        civicScore: number;
        currentTier: ReputationTier;
        nextTier: ReputationTier | null;
        progressPercent: number;
        badges: Badge[];
      }>(`/api/reputation/${identityId}`);
      setCivicScore(data.civicScore);
      setCurrentTier(data.currentTier);
      setNextTier(data.nextTier);
      setProgressPercent(data.progressPercent);
      setBadges(data.badges);
    } catch {
      // leave state as-is on failure
    } finally {
      setIsLoading(false);
    }
  }, [identityId, isVerified]);

  useEffect(() => {
    refreshReputation();
  }, [refreshReputation]);

  const value = useMemo<ReputationContextValue>(
    () => ({ civicScore, currentTier, nextTier, progressPercent, badges, isLoading, refreshReputation }),
    [civicScore, currentTier, nextTier, progressPercent, badges, isLoading, refreshReputation]
  );

  return <ReputationContext.Provider value={value}>{children}</ReputationContext.Provider>;
}

export function useReputation(): ReputationContextValue {
  const ctx = useContext(ReputationContext);
  if (!ctx) {
    throw new Error("useReputation must be used within a ReputationProvider");
  }
  return ctx;
}
