"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/apiClient";
import { useIdentity } from "@/context/IdentityContext";
import { JOB_CATEGORIES } from "@/context/JobsContext";

export type OpportunityKind = "job" | "apprenticeship" | "civic_task" | "scholarship" | "grant" | "volunteer";

export const OPPORTUNITY_KIND_LABELS: Record<OpportunityKind, string> = {
  job: "Job booking",
  apprenticeship: "Apprenticeship",
  civic_task: "Civic task",
  scholarship: "Scholarship",
  grant: "Grant",
  volunteer: "Volunteer role",
};

export const INTEREST_TAGS: string[] = [
  ...JOB_CATEGORIES.map((c) => c.label),
  "Farming",
  "Music",
  "Coding",
  "Teaching",
  "Sports",
  "Healthcare",
];

export interface Opportunity {
  id: string;
  kind: OpportunityKind;
  title: string;
  description: string;
  requiredSkills: string[];
  minCivicScore: number;
  requiresIndigene: boolean;
  rewardDescription: string;
  deadline: string;
  location: string;
}

export interface MatchedOpportunity {
  opportunity: Opportunity;
  score: number;
  reasons: string[];
}

export interface InterestExpression {
  id: string;
  opportunityId: string;
  timestamp: number;
}

interface BackendOpportunity {
  _id: string;
  kind: OpportunityKind;
  title: string;
  description: string;
  requiredSkills: string[];
  minCivicScore: number;
  requiresIndigene: boolean;
  rewardDescription: string;
  deadline: string;
  location: string;
}

interface BackendMatch {
  opportunity: BackendOpportunity;
  score: number;
  reasons: string[];
}

function toOpportunity(doc: BackendOpportunity): Opportunity {
  return {
    id: doc._id,
    kind: doc.kind,
    title: doc.title,
    description: doc.description,
    requiredSkills: doc.requiredSkills,
    minCivicScore: doc.minCivicScore,
    requiresIndigene: doc.requiresIndigene,
    rewardDescription: doc.rewardDescription,
    deadline: doc.deadline,
    location: doc.location,
  };
}

interface OpportunityEngineContextValue {
  interests: string[];
  toggleInterest: (tag: string) => void;
  opportunities: Opportunity[];
  matches: MatchedOpportunity[];
  expressions: InterestExpression[];
  isLoading: boolean;
  expressInterest: (opportunityId: string) => Promise<void>;
}

const OpportunityEngineContext = createContext<OpportunityEngineContextValue | undefined>(undefined);

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function OpportunityEngineProvider({ children }: { children: React.ReactNode }) {
  const { identityId } = useIdentity();
  const [interests, setInterests] = useState<string[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [matches, setMatches] = useState<MatchedOpportunity[]>([]);
  const [expressions, setExpressions] = useState<InterestExpression[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = useCallback((tag: string) => {
    setInterests((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }, []);

  // Matching is computed server-side (same rule-based logic ported from this
  // context originally) so it stays accurate to civic score and indigene
  // status stored in the database, not stale client state.
  const refreshMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (identityId) params.set("ekitiId", identityId);
      if (interests.length > 0) params.set("interests", interests.join(","));

      const [fetchedOpportunities, fetchedMatches] = await Promise.all([
        api.get<BackendOpportunity[]>("/api/opportunity"),
        api.get<BackendMatch[]>(`/api/opportunity/matches?${params.toString()}`),
      ]);
      setOpportunities(fetchedOpportunities.map(toOpportunity));
      setMatches(fetchedMatches.map((m) => ({ opportunity: toOpportunity(m.opportunity), score: m.score, reasons: m.reasons })));
    } catch {
      // leave state as-is on failure
    } finally {
      setIsLoading(false);
    }
  }, [identityId, interests]);

  useEffect(() => {
    refreshMatches();
  }, [refreshMatches]);

  const expressInterest = useCallback(
    async (opportunityId: string) => {
      try {
        await api.post("/api/opportunity/interest", { opportunityId, citizenEkitiId: identityId ?? undefined });
        setExpressions((prev) => [{ id: makeId("interest"), opportunityId, timestamp: Date.now() }, ...prev]);
      } catch {
        // no-op on failure
      }
    },
    [identityId]
  );

  const value = useMemo<OpportunityEngineContextValue>(
    () => ({ interests, toggleInterest, opportunities, matches, expressions, isLoading, expressInterest }),
    [interests, toggleInterest, opportunities, matches, expressions, isLoading, expressInterest]
  );

  return <OpportunityEngineContext.Provider value={value}>{children}</OpportunityEngineContext.Provider>;
}

export function useOpportunityEngine(): OpportunityEngineContextValue {
  const ctx = useContext(OpportunityEngineContext);
  if (!ctx) {
    throw new Error("useOpportunityEngine must be used within an OpportunityEngineProvider");
  }
  return ctx;
}
