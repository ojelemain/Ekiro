"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/apiClient";
import { useIdentity } from "@/context/IdentityContext";

export type ContributionType =
  | "mentorship"
  | "education_sponsorship"
  | "sme_investment"
  | "infrastructure_funding"
  | "healthcare_support"
  | "school_adoption"
  | "equipment_contribution"
  | "innovation_challenge";

export const CONTRIBUTION_TYPE_LABELS: Record<ContributionType, string> = {
  mentorship: "Mentorship",
  education_sponsorship: "Education sponsorship",
  sme_investment: "SME investment",
  infrastructure_funding: "Infrastructure funding",
  healthcare_support: "Healthcare support",
  school_adoption: "School adoption",
  equipment_contribution: "Equipment contribution",
  innovation_challenge: "Innovation challenge",
};

export interface FundableProject {
  id: string;
  type: ContributionType;
  title: string;
  description: string;
  location: string;
  targetNaira: number | null;
  raisedNaira: number;
}

export interface Contribution {
  id: string;
  type: ContributionType;
  targetId: string;
  targetTitle: string;
  amountNaira: number | null;
  diasporaName: string;
  impactNote: string;
  timestamp: number;
}

interface BackendProject {
  _id: string;
  type: ContributionType;
  title: string;
  description: string;
  location: string;
  targetNaira: number | null;
  raisedNaira: number;
}

interface BackendContribution {
  _id: string;
  type: ContributionType;
  targetId: string;
  targetTitle: string;
  amountNaira: number | null;
  diasporaName: string;
  impactNote: string;
  createdAt: string;
}

function toProject(doc: BackendProject): FundableProject {
  return {
    id: doc._id,
    type: doc.type,
    title: doc.title,
    description: doc.description,
    location: doc.location,
    targetNaira: doc.targetNaira,
    raisedNaira: doc.raisedNaira,
  };
}

function toContribution(doc: BackendContribution): Contribution {
  return {
    id: doc._id,
    type: doc.type,
    targetId: doc.targetId,
    targetTitle: doc.targetTitle,
    amountNaira: doc.amountNaira,
    diasporaName: doc.diasporaName,
    impactNote: doc.impactNote,
    timestamp: new Date(doc.createdAt).getTime(),
  };
}

interface DiasporaEngineContextValue {
  projects: FundableProject[];
  contributions: Contribution[];
  isLoading: boolean;
  fundProject: (projectId: string, amountNaira: number, diasporaName: string) => Promise<{ success: boolean; reason?: string }>;
  mentorTalent: (talentId: string, talentName: string, diasporaName: string) => Promise<Contribution | null>;
  totalContributedNaira: number;
}

const DiasporaEngineContext = createContext<DiasporaEngineContextValue | undefined>(undefined);

export function DiasporaEngineProvider({ children }: { children: React.ReactNode }) {
  const { identityId } = useIdentity();
  const [projects, setProjects] = useState<FundableProject[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedProjects, fetchedContributions] = await Promise.all([
        api.get<BackendProject[]>("/api/diaspora/projects"),
        api.get<BackendContribution[]>(
          identityId ? `/api/diaspora/contributions?diasporaEkitiId=${identityId}` : "/api/diaspora/contributions"
        ),
      ]);
      setProjects(fetchedProjects.map(toProject));
      setContributions(fetchedContributions.map(toContribution));
    } catch {
      // leave state as-is on failure
    } finally {
      setIsLoading(false);
    }
  }, [identityId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const fundProject = useCallback(
    async (projectId: string, amountNaira: number, diasporaName: string): Promise<{ success: boolean; reason?: string }> => {
      try {
        const result = await api.post<{ project: BackendProject; contribution: BackendContribution }>(
          `/api/diaspora/projects/${projectId}/fund`,
          { amountNaira, diasporaEkitiId: identityId, diasporaName }
        );
        setProjects((prev) => prev.map((p) => (p.id === projectId ? toProject(result.project) : p)));
        setContributions((prev) => [toContribution(result.contribution), ...prev]);
        return { success: true };
      } catch (err) {
        return { success: false, reason: (err as Error).message || "Unable to process this contribution." };
      }
    },
    [identityId]
  );

  const mentorTalent = useCallback(
    async (talentId: string, talentName: string, diasporaName: string): Promise<Contribution | null> => {
      try {
        const created = await api.post<BackendContribution>("/api/diaspora/mentor", {
          talentId,
          talentName,
          diasporaEkitiId: identityId,
          diasporaName,
        });
        const contribution = toContribution(created);
        setContributions((prev) => [contribution, ...prev]);
        return contribution;
      } catch {
        return null;
      }
    },
    [identityId]
  );

  const totalContributedNaira = useMemo(
    () => contributions.reduce((sum, c) => sum + (c.amountNaira ?? 0), 0),
    [contributions]
  );

  const value = useMemo<DiasporaEngineContextValue>(
    () => ({ projects, contributions, isLoading, fundProject, mentorTalent, totalContributedNaira }),
    [projects, contributions, isLoading, fundProject, mentorTalent, totalContributedNaira]
  );

  return <DiasporaEngineContext.Provider value={value}>{children}</DiasporaEngineContext.Provider>;
}

export function useDiasporaEngine(): DiasporaEngineContextValue {
  const ctx = useContext(DiasporaEngineContext);
  if (!ctx) {
    throw new Error("useDiasporaEngine must be used within a DiasporaEngineProvider");
  }
  return ctx;
}
