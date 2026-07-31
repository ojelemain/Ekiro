"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/apiClient";
import { useIdentity } from "@/context/IdentityContext";

export type TalentCategory =
  | "Artisan"
  | "Farmer"
  | "Musician"
  | "Athlete"
  | "Coder"
  | "Teacher"
  | "Creative"
  | "Entrepreneur"
  | "Inventor"
  | "Academic Excellence";

export const TALENT_CATEGORIES: TalentCategory[] = [
  "Artisan",
  "Farmer",
  "Musician",
  "Athlete",
  "Coder",
  "Teacher",
  "Creative",
  "Entrepreneur",
  "Inventor",
  "Academic Excellence",
];

export type NominatorType = "self" | "school" | "community";

export interface TalentProfile {
  id: string;
  ownerName: string;
  category: TalentCategory;
  headline: string;
  description: string;
  lgaName: string;
  nominatedBy: NominatorType;
  nominatorName: string | null;
  createdAt: number;
  isSelf?: boolean;
}

interface BackendTalent {
  _id: string;
  ownerName: string;
  category: TalentCategory;
  headline: string;
  description: string;
  lgaName: string;
  nominatedBy: NominatorType;
  nominatorName?: string;
  isSelf: boolean;
  createdAt: string;
}

function toTalentProfile(doc: BackendTalent): TalentProfile {
  return {
    id: doc._id,
    ownerName: doc.ownerName,
    category: doc.category,
    headline: doc.headline,
    description: doc.description,
    lgaName: doc.lgaName,
    nominatedBy: doc.nominatedBy,
    nominatorName: doc.nominatorName ?? null,
    createdAt: new Date(doc.createdAt).getTime(),
    isSelf: doc.isSelf,
  };
}

interface TalentEngineContextValue {
  talents: TalentProfile[];
  isLoading: boolean;
  createTalentProfile: (input: Omit<TalentProfile, "id" | "createdAt" | "nominatedBy" | "nominatorName">) => Promise<TalentProfile | null>;
  nominateTalent: (
    input: Omit<TalentProfile, "id" | "createdAt" | "nominatedBy"> & { nominatorType: NominatorType; nominatorName: string }
  ) => Promise<TalentProfile | null>;
  expressMentorshipInterest: (talentId: string) => Promise<void>;
  categoryBreakdown: { category: TalentCategory; count: number }[];
  lgaBreakdown: { lgaName: string; count: number }[];
}

const TalentEngineContext = createContext<TalentEngineContextValue | undefined>(undefined);

export function TalentEngineProvider({ children }: { children: React.ReactNode }) {
  const { identityId } = useIdentity();
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [breakdown, setBreakdown] = useState<{
    categoryBreakdown: { category: TalentCategory; count: number }[];
    lgaBreakdown: { lgaName: string; count: number }[];
  }>({ categoryBreakdown: [], lgaBreakdown: [] });
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedTalents, fetchedBreakdown] = await Promise.all([
        api.get<BackendTalent[]>("/api/talent"),
        api.get<{ categoryBreakdown: { category: TalentCategory; count: number }[]; lgaBreakdown: { lgaName: string; count: number }[] }>(
          "/api/talent/breakdown"
        ),
      ]);
      setTalents(fetchedTalents.map(toTalentProfile));
      setBreakdown(fetchedBreakdown);
    } catch {
      // leave state as-is on failure
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTalentProfile = useCallback(
    async (input: Omit<TalentProfile, "id" | "createdAt" | "nominatedBy" | "nominatorName">): Promise<TalentProfile | null> => {
      try {
        const created = await api.post<BackendTalent>("/api/talent", { ...input, ownerEkitiId: identityId ?? undefined });
        const profile = toTalentProfile(created);
        setTalents((prev) => [profile, ...prev]);
        refresh();
        return profile;
      } catch {
        return null;
      }
    },
    [identityId, refresh]
  );

  const nominateTalent = useCallback(
    async (
      input: Omit<TalentProfile, "id" | "createdAt" | "nominatedBy"> & { nominatorType: NominatorType; nominatorName: string }
    ): Promise<TalentProfile | null> => {
      try {
        const created = await api.post<BackendTalent>("/api/talent/nominate", {
          ...input,
          ownerEkitiId: identityId ?? undefined,
        });
        const profile = toTalentProfile(created);
        setTalents((prev) => [profile, ...prev]);
        refresh();
        return profile;
      } catch {
        return null;
      }
    },
    [identityId, refresh]
  );

  const expressMentorshipInterest = useCallback(async (talentId: string) => {
    try {
      await api.post("/api/talent/mentorship-interest", { talentId });
    } catch {
      // no-op on failure
    }
  }, []);

  const value = useMemo<TalentEngineContextValue>(
    () => ({
      talents,
      isLoading,
      createTalentProfile,
      nominateTalent,
      expressMentorshipInterest,
      categoryBreakdown: breakdown.categoryBreakdown,
      lgaBreakdown: breakdown.lgaBreakdown,
    }),
    [talents, isLoading, createTalentProfile, nominateTalent, expressMentorshipInterest, breakdown]
  );

  return <TalentEngineContext.Provider value={value}>{children}</TalentEngineContext.Provider>;
}

export function useTalentEngine(): TalentEngineContextValue {
  const ctx = useContext(TalentEngineContext);
  if (!ctx) {
    throw new Error("useTalentEngine must be used within a TalentEngineProvider");
  }
  return ctx;
}
