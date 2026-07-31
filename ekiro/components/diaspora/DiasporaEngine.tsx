"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Globe2, HeartHandshake, ListChecks, MapPin, Plane, Sparkles } from "lucide-react";
import { useIdentity } from "@/context/IdentityContext";
import { useTalentEngine } from "@/context/TalentEngineContext";
import {
  useDiasporaEngine,
  CONTRIBUTION_TYPE_LABELS,
  type FundableProject,
} from "@/context/DiasporaEngineContext";

type Tab = "mentor" | "fund" | "impact";

export default function DiasporaEngine() {
  const { profile, isIndigeneVerified } = useIdentity();
  const [tab, setTab] = useState<Tab>("fund");

  const isEligible = isIndigeneVerified && profile.residency === "diaspora";

  if (!isEligible) return <DiasporaGate isIndigeneVerified={isIndigeneVerified} residency={profile.residency} />;

  return (
    <div className="min-h-screen bg-ekiti-canvas">
      <header className="px-5 sm:px-10 py-6 border-b border-ekiti-neutral/10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-ekiti-green mb-1">
          Diaspora Engine
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">Beyond donations — measurable impact</h1>
        <p className="text-xs opacity-60 mt-1 max-w-xl">
          Mentor talent, fund a specific project, or invest in a small business — every contribution is tracked
          and reported back to you, not sent into a black box.
        </p>
      </header>

      <div className="px-5 sm:px-10 pt-5 flex gap-2 flex-wrap">
        <TabButton active={tab === "fund"} onClick={() => setTab("fund")} icon={Globe2} label="Fund a Project" />
        <TabButton active={tab === "mentor"} onClick={() => setTab("mentor")} icon={HeartHandshake} label="Mentor a Talent" />
        <TabButton active={tab === "impact"} onClick={() => setTab("impact")} icon={ListChecks} label="My Contributions" />
      </div>

      <main className="px-5 sm:px-10 py-6">
        {tab === "fund" && <FundAProject diasporaName={profile.fullName} />}
        {tab === "mentor" && <MentorATalent diasporaName={profile.fullName} />}
        {tab === "impact" && <MyContributions />}
      </main>
    </div>
  );
}

function DiasporaGate({
  isIndigeneVerified,
  residency,
}: {
  isIndigeneVerified: boolean;
  residency: string | null;
}) {
  return (
    <div className="min-h-screen bg-ekiti-canvas flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <div className="w-[72px] h-[72px] rounded-full bg-[#EAF2ED] flex items-center justify-center mx-auto mb-5">
          <Plane size={32} className="text-ekiti-green" />
        </div>
        <h1 className="font-display text-2xl font-semibold mb-2">Reserved for verified diaspora indigenes</h1>
        <p className="text-sm opacity-70 leading-relaxed mb-6">
          {!isIndigeneVerified
            ? "This feature requires Indigene Verification, not just Resident Access — it's one of the heritage-based programs reserved for verified Ekiti indigenes."
            : residency !== "diaspora"
            ? "Your Ekiti ID is indigene-verified, but this feature is specifically for indigenes currently living abroad. Update your residency status if that's changed."
            : "Complete Indigene Verification to access diaspora programs."}
        </p>
        <Link
          href="/ekiti-id"
          className="inline-block min-h-[52px] leading-[52px] px-6 rounded-sm bg-ekiti-gold text-ekiti-neutral font-semibold"
        >
          Review Ekiti ID
        </Link>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Globe2;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 min-h-[48px] rounded-sm text-sm font-semibold ${
        active ? "bg-ekiti-green text-white" : "border border-ekiti-neutral/20"
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );
}

function FundAProject({ diasporaName }: { diasporaName: string }) {
  const { projects, fundProject } = useDiasporaEngine();
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});

  const handleFund = async (project: FundableProject) => {
    const amount = Number(amounts[project.id] ?? 0);
    const result = await fundProject(project.id, amount, diasporaName || "Diaspora supporter");
    setMessages((prev) => ({
      ...prev,
      [project.id]: result.success ? `₦${amount.toLocaleString()} recorded — thank you.` : result.reason ?? "Unable to process.",
    }));
    if (result.success) setAmounts((prev) => ({ ...prev, [project.id]: "" }));
  };

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((p) => {
        const percent = p.targetNaira ? Math.min(100, Math.round((p.raisedNaira / p.targetNaira) * 100)) : 0;
        return (
          <div key={p.id} className="rounded-sm border border-ekiti-neutral/10 bg-white p-6 flex flex-col gap-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ekiti-green">
              {CONTRIBUTION_TYPE_LABELS[p.type]}
            </span>
            <h3 className="font-display text-lg font-semibold">{p.title}</h3>
            <p className="text-sm opacity-70 leading-relaxed">{p.description}</p>
            <div className="flex items-center gap-1.5 text-xs font-mono opacity-60">
              <MapPin size={12} /> {p.location}
            </div>

            {p.targetNaira && (
              <div>
                <div className="flex items-center justify-between text-xs font-mono opacity-60 mb-1.5">
                  <span>₦{p.raisedNaira.toLocaleString()} raised</span>
                  <span>of ₦{p.targetNaira.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-ekiti-neutral/10 overflow-hidden">
                  <div className="h-full bg-ekiti-gold rounded-full" style={{ width: `${percent}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <input
                value={amounts[p.id] ?? ""}
                onChange={(e) => setAmounts((prev) => ({ ...prev, [p.id]: e.target.value.replace(/\D/g, "") }))}
                placeholder="Amount (₦)"
                className="flex-1 min-h-[44px] px-3 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => handleFund(p)}
                className="min-h-[44px] px-4 rounded-sm bg-ekiti-neutral text-white text-sm font-semibold"
              >
                Fund
              </button>
            </div>
            {messages[p.id] && <p className="text-xs text-ekiti-green">{messages[p.id]}</p>}
          </div>
        );
      })}
    </div>
  );
}

function MentorATalent({ diasporaName }: { diasporaName: string }) {
  const { talents } = useTalentEngine();
  const { mentorTalent } = useDiasporaEngine();
  const [mentored, setMentored] = useState<Record<string, boolean>>({});

  const handleMentor = async (talentId: string, talentName: string) => {
    const result = await mentorTalent(talentId, talentName, diasporaName || "Diaspora mentor");
    if (result) setMentored((prev) => ({ ...prev, [talentId]: true }));
  };

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {talents.map((t) => (
        <div key={t.id} className="rounded-sm border border-ekiti-neutral/10 bg-white p-6 flex flex-col gap-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ekiti-green">{t.category}</span>
          <h3 className="font-display text-lg font-semibold">{t.ownerName}</h3>
          <p className="text-sm font-medium opacity-90">{t.headline}</p>
          <p className="text-sm opacity-70 leading-relaxed">{t.description}</p>
          {t.nominatorName && (
            <div className="flex items-center gap-1 text-xs text-ekiti-gold font-semibold">
              <Sparkles size={12} /> Endorsed by {t.nominatorName}
            </div>
          )}
          {mentored[t.id] ? (
            <div className="min-h-[44px] flex items-center justify-center gap-2 rounded-sm bg-[#EAF2ED] text-ekiti-green text-sm font-semibold">
              <CheckCircle2 size={14} /> Mentorship committed
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleMentor(t.id, t.ownerName)}
              className="min-h-[44px] rounded-sm bg-ekiti-neutral text-white text-sm font-semibold"
            >
              Commit to mentor
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function MyContributions() {
  const { contributions, totalContributedNaira } = useDiasporaEngine();

  if (contributions.length === 0) {
    return (
      <p className="text-sm opacity-60 max-w-md">
        No contributions yet this session. Fund a project or commit to mentor someone to see your impact log
        build up here.
      </p>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-sm bg-ekiti-neutral text-white p-5 mb-6 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-widest opacity-70">Total contributed</span>
        <span className="font-display text-2xl text-ekiti-gold">₦{totalContributedNaira.toLocaleString()}</span>
      </div>

      <ul className="flex flex-col gap-3">
        {contributions.map((c) => (
          <li key={c.id} className="rounded-sm border border-ekiti-neutral/10 bg-white p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-ekiti-green">
                {CONTRIBUTION_TYPE_LABELS[c.type]}
              </span>
              <span className="text-xs font-mono opacity-50">{new Date(c.timestamp).toLocaleDateString()}</span>
            </div>
            <div className="text-sm font-medium mb-1">{c.targetTitle}</div>
            {c.amountNaira !== null && (
              <div className="text-sm text-ekiti-green font-semibold mb-2">₦{c.amountNaira.toLocaleString()}</div>
            )}
            <p className="text-xs opacity-70 leading-relaxed">{c.impactNote}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
