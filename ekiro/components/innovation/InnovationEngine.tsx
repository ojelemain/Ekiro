"use client";

import React, { useState } from "react";
import { Award, CheckCircle2, Gavel, Lightbulb, ThumbsUp, Trophy } from "lucide-react";
import { useIdentity } from "@/context/IdentityContext";
import { useReputation } from "@/context/ReputationContext";
import { useInnovationEngine, type InnovationChallenge } from "@/context/InnovationEngineContext";
import IdentityGate from "@/components/identity/IdentityGate";

const inputClass =
  "w-full min-h-[52px] px-3.5 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none focus:border-ekiti-gold";
const textareaClass =
  "w-full px-3.5 py-3 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none focus:border-ekiti-gold";

export default function InnovationEngine() {
  const { isVerified, profile } = useIdentity();
  const { currentTier } = useReputation();
  const { challenges, submissions, submitSolution, endorseSubmission, declareWinner } = useInnovationEngine();
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

  if (!isVerified) return <IdentityGate />;

  const isEligibleJudge = currentTier.name === "State Honoree";
  const activeChallenge = challenges.find((c) => c.id === activeChallengeId) ?? null;
  const submissionsForActive = submissions.filter((s) => s.challengeId === activeChallengeId);

  return (
    <div className="min-h-screen bg-ekiti-canvas">
      <header className="px-5 sm:px-10 py-6 border-b border-ekiti-neutral/10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-ekiti-green mb-1">
          Innovation Engine
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">Real problems. Real solutions. Real funding.</h1>
        <p className="text-xs opacity-60 mt-1 max-w-xl">
          Government posts real problems; students, developers, businesses, and researchers compete to solve
          them. Winning ideas receive funding and implementation support.
        </p>
        {isEligibleJudge && (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-ekiti-gold">
            <Gavel size={14} /> You're eligible to judge as a State Honoree
          </div>
        )}
      </header>

      <main className="px-5 sm:px-10 py-6">
        {!activeChallenge ? (
          <ChallengeList challenges={challenges} onSelect={setActiveChallengeId} />
        ) : (
          <ChallengeDetail
            challenge={activeChallenge}
            submissions={submissionsForActive}
            submitterName={profile.fullName}
            isEligibleJudge={isEligibleJudge}
            onBack={() => setActiveChallengeId(null)}
            onSubmit={submitSolution}
            onEndorse={endorseSubmission}
            onDeclareWinner={declareWinner}
          />
        )}
      </main>
    </div>
  );
}

function ChallengeList({
  challenges,
  onSelect,
}: {
  challenges: InnovationChallenge[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {challenges.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c.id)}
          className="text-left rounded-sm border border-ekiti-neutral/10 bg-white p-6 flex flex-col gap-3 hover:border-ekiti-gold"
        >
          <span className="font-mono text-[11px] uppercase tracking-wider text-ekiti-green">{c.postedBy}</span>
          <h3 className="font-display text-lg font-semibold">{c.title}</h3>
          <p className="text-sm opacity-70 leading-relaxed">{c.description}</p>
          <div className="flex items-center justify-between pt-2 border-t border-ekiti-neutral/10 text-xs font-mono">
            <span className="text-ekiti-green font-semibold">{c.prizeDescription}</span>
            <span className="opacity-60">{c.deadline}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function ChallengeDetail({
  challenge,
  submissions,
  submitterName,
  isEligibleJudge,
  onBack,
  onSubmit,
  onEndorse,
  onDeclareWinner,
}: {
  challenge: InnovationChallenge;
  submissions: ReturnType<typeof useInnovationEngine>["submissions"];
  submitterName: string;
  isEligibleJudge: boolean;
  onBack: () => void;
  onSubmit: ReturnType<typeof useInnovationEngine>["submitSolution"];
  onEndorse: (id: string) => void;
  onDeclareWinner: (id: string) => Promise<{ success: boolean; reason?: string }>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [judgeError, setJudgeError] = useState<string | null>(null);

  const handleDeclareWinner = async (submissionId: string) => {
    const result = await onDeclareWinner(submissionId);
    if (!result.success) setJudgeError(result.reason ?? "Unable to declare a winner right now.");
  };

  const submit = () => {
    if (!title.trim() || !description.trim()) return;
    onSubmit({ challengeId: challenge.id, submitterName: submitterName || "Anonymous submitter", title, description, link });
    setTitle("");
    setDescription("");
    setLink("");
    setShowForm(false);
  };

  const sorted = [...submissions].sort((a, b) => b.endorsements - a.endorsements);

  return (
    <div className="max-w-2xl">
      <button type="button" onClick={onBack} className="text-sm font-semibold text-ekiti-green mb-4">
        ← All challenges
      </button>

      <div className="rounded-sm border border-ekiti-neutral/10 bg-white p-6 mb-6">
        <span className="font-mono text-[11px] uppercase tracking-wider text-ekiti-green">{challenge.postedBy}</span>
        <h2 className="font-display text-xl font-semibold mt-1 mb-2">{challenge.title}</h2>
        <p className="text-sm opacity-75 leading-relaxed mb-3">{challenge.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-ekiti-green font-semibold">{challenge.prizeDescription}</span>
          <span className="text-xs font-mono opacity-60">{challenge.deadline}</span>
        </div>
      </div>

      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mb-6 min-h-[48px] px-5 rounded-sm bg-ekiti-gold text-ekiti-neutral font-semibold text-sm flex items-center gap-2"
        >
          <Lightbulb size={16} /> Submit a solution
        </button>
      ) : (
        <div className="rounded-sm border border-ekiti-neutral/10 bg-white p-6 mb-6 flex flex-col gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Solution title" className={inputClass} />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe your solution and how it would work"
            className={textareaClass}
          />
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Link to prototype/document (optional)"
            className={inputClass}
          />
          <div className="flex gap-2">
            <button type="button" onClick={submit} className="flex-1 min-h-[48px] rounded-sm bg-ekiti-neutral text-white font-semibold text-sm">
              Submit
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="min-h-[48px] px-5 rounded-sm border border-ekiti-neutral/20 font-semibold text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <h3 className="font-display text-lg font-semibold mb-4">Submissions ({sorted.length})</h3>
      <div className="flex flex-col gap-3">
        {sorted.length === 0 && <p className="text-sm opacity-60">No submissions yet — be the first.</p>}
        {sorted.map((s) => (
          <div key={s.id} className={`rounded-sm border p-5 ${s.isWinner ? "border-ekiti-gold bg-[#FFF8E7]" : "border-ekiti-neutral/10 bg-white"}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold">{s.title}</span>
              {s.isWinner && (
                <span className="flex items-center gap-1 text-xs font-semibold text-ekiti-gold">
                  <Trophy size={13} /> Winner
                </span>
              )}
            </div>
            <p className="text-xs font-mono opacity-50 mb-2">by {s.submitterName}</p>
            <p className="text-sm opacity-75 leading-relaxed mb-3">{s.description}</p>
            {s.link && <p className="text-xs font-mono opacity-60 mb-3 break-all">{s.link}</p>}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEndorse(s.id)}
                className="flex items-center gap-1.5 min-h-[40px] px-3 rounded-sm border border-ekiti-neutral/20 text-xs font-semibold"
              >
                <ThumbsUp size={13} /> {s.endorsements}
              </button>
              {isEligibleJudge && !s.isWinner && (
                <button
                  type="button"
                  onClick={() => handleDeclareWinner(s.id)}
                  className="flex items-center gap-1.5 min-h-[40px] px-3 rounded-sm bg-ekiti-neutral text-white text-xs font-semibold"
                >
                  <Award size={13} /> Declare winner
                </button>
              )}
              {s.isWinner && (
                <span className="flex items-center gap-1.5 min-h-[40px] px-3 text-xs text-ekiti-green">
                  <CheckCircle2 size={13} /> Funding process begins
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      {judgeError && <p className="text-xs text-red-600 mt-3">{judgeError}</p>}
    </div>
  );
}
