"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/apiClient";
import { useIdentity } from "@/context/IdentityContext";

export type ChallengeStatus = "open" | "closed";

export interface InnovationChallenge {
  id: string;
  title: string;
  description: string;
  postedBy: string;
  prizeDescription: string;
  deadline: string;
  status: ChallengeStatus;
}

export interface Submission {
  id: string;
  challengeId: string;
  submitterName: string;
  title: string;
  description: string;
  link: string;
  endorsements: number;
  isWinner: boolean;
  createdAt: number;
}

interface BackendChallenge {
  _id: string;
  title: string;
  description: string;
  postedBy: string;
  prizeDescription: string;
  deadline: string;
  status: ChallengeStatus;
}

interface BackendSubmission {
  _id: string;
  challenge: string;
  submitterName: string;
  title: string;
  description: string;
  link?: string;
  endorsements: number;
  isWinner: boolean;
  createdAt: string;
}

function toChallenge(doc: BackendChallenge): InnovationChallenge {
  return {
    id: doc._id,
    title: doc.title,
    description: doc.description,
    postedBy: doc.postedBy,
    prizeDescription: doc.prizeDescription,
    deadline: doc.deadline,
    status: doc.status,
  };
}

function toSubmission(doc: BackendSubmission): Submission {
  return {
    id: doc._id,
    challengeId: doc.challenge,
    submitterName: doc.submitterName,
    title: doc.title,
    description: doc.description,
    link: doc.link ?? "",
    endorsements: doc.endorsements,
    isWinner: doc.isWinner,
    createdAt: new Date(doc.createdAt).getTime(),
  };
}

interface InnovationEngineContextValue {
  challenges: InnovationChallenge[];
  submissions: Submission[];
  isLoading: boolean;
  submitSolution: (input: {
    challengeId: string;
    submitterName: string;
    title: string;
    description: string;
    link: string;
  }) => Promise<Submission | null>;
  endorseSubmission: (submissionId: string) => Promise<void>;
  declareWinner: (submissionId: string) => Promise<{ success: boolean; reason?: string }>;
}

const InnovationEngineContext = createContext<InnovationEngineContextValue | undefined>(undefined);

export function InnovationEngineProvider({ children }: { children: React.ReactNode }) {
  const { identityId } = useIdentity();
  const [challenges, setChallenges] = useState<InnovationChallenge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedChallenges = await api.get<BackendChallenge[]>("/api/innovation/challenges");
      const mappedChallenges = fetchedChallenges.map(toChallenge);
      setChallenges(mappedChallenges);

      const perChallenge = await Promise.all(
        mappedChallenges.map((c) => api.get<BackendSubmission[]>(`/api/innovation/challenges/${c.id}/submissions`))
      );
      setSubmissions(perChallenge.flat().map(toSubmission));
    } catch {
      // leave state as-is on failure
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submitSolution = useCallback(
    async (input: {
      challengeId: string;
      submitterName: string;
      title: string;
      description: string;
      link: string;
    }): Promise<Submission | null> => {
      try {
        const created = await api.post<BackendSubmission>(`/api/innovation/challenges/${input.challengeId}/submissions`, {
          submitterName: input.submitterName,
          title: input.title,
          description: input.description,
          link: input.link,
          submitterEkitiId: identityId ?? undefined,
        });
        const submission = toSubmission(created);
        setSubmissions((prev) => [submission, ...prev]);
        return submission;
      } catch {
        return null;
      }
    },
    [identityId]
  );

  const endorseSubmission = useCallback(async (submissionId: string) => {
    try {
      const updated = await api.post<BackendSubmission>(`/api/innovation/submissions/${submissionId}/endorse`, {});
      setSubmissions((prev) => prev.map((s) => (s.id === submissionId ? toSubmission(updated) : s)));
    } catch {
      // no-op on failure
    }
  }, []);

  const declareWinner = useCallback(
    async (submissionId: string): Promise<{ success: boolean; reason?: string }> => {
      try {
        const updated = await api.post<BackendSubmission>(`/api/innovation/submissions/${submissionId}/declare-winner`, {
          judgeEkitiId: identityId,
        });
        setSubmissions((prev) => prev.map((s) => (s.id === submissionId ? toSubmission(updated) : s)));
        return { success: true };
      } catch (err) {
        return { success: false, reason: (err as Error).message || "Only State Honoree tier can declare a winner." };
      }
    },
    [identityId]
  );

  const value = useMemo<InnovationEngineContextValue>(
    () => ({ challenges, submissions, isLoading, submitSolution, endorseSubmission, declareWinner }),
    [challenges, submissions, isLoading, submitSolution, endorseSubmission, declareWinner]
  );

  return <InnovationEngineContext.Provider value={value}>{children}</InnovationEngineContext.Provider>;
}

export function useInnovationEngine(): InnovationEngineContextValue {
  const ctx = useContext(InnovationEngineContext);
  if (!ctx) {
    throw new Error("useInnovationEngine must be used within an InnovationEngineProvider");
  }
  return ctx;
}
