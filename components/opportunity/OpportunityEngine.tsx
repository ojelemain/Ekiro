"use client";

import React, { useState } from "react";
import { CheckCircle2, Compass, MapPin, Sparkles } from "lucide-react";
import { useIdentity } from "@/context/IdentityContext";
import {
  useOpportunityEngine,
  INTEREST_TAGS,
  OPPORTUNITY_KIND_LABELS,
  type MatchedOpportunity,
} from "@/context/OpportunityEngineContext";
import IdentityGate from "@/components/identity/IdentityGate";

export default function OpportunityEngine() {
  const { isVerified } = useIdentity();
  const { interests, toggleInterest, matches, expressInterest, expressions } = useOpportunityEngine();
  const [expressedIds, setExpressedIds] = useState<Set<string>>(new Set());

  if (!isVerified) return <IdentityGate />;

  const handleExpress = (opportunityId: string) => {
    expressInterest(opportunityId);
    setExpressedIds((prev) => new Set(prev).add(opportunityId));
  };

  const goodMatches = matches.filter((m) => m.score >= 40);
  const otherOpportunities = matches.filter((m) => m.score < 40);

  return (
    <div className="min-h-screen bg-ekiti-canvas">
      <header className="px-5 sm:px-10 py-6 border-b border-ekiti-neutral/10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-ekiti-green mb-1">
          Opportunity Engine
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">Opportunities that search for you</h1>
        <p className="text-xs opacity-60 mt-1 max-w-xl">
          Matched against your skills, civic score, and verification status — not a plain listing. This is
          rule-based matching today; a production version would swap in a learned ranking model.
        </p>
      </header>

      <section className="px-5 sm:px-10 py-6 border-b border-ekiti-neutral/10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-ekiti-green" />
          <h2 className="text-sm font-semibold">Your interests (pick a few to improve matches)</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {INTEREST_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleInterest(tag)}
              className={`px-3 py-2 rounded-full text-xs font-semibold ${
                interests.includes(tag) ? "bg-ekiti-neutral text-white" : "border border-ekiti-neutral/20"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <main className="px-5 sm:px-10 py-6 flex flex-col gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Compass size={18} className="text-ekiti-green" />
            <h2 className="font-display text-lg font-semibold">Recommended for you</h2>
          </div>
          {goodMatches.length === 0 ? (
            <p className="text-sm opacity-60 max-w-md">
              Select a few interests above, or complete a booking on the Jobs Marketplace, to get strong matches.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {goodMatches.map((m) => (
                <OpportunityCard
                  key={m.opportunity.id}
                  match={m}
                  expressed={expressedIds.has(m.opportunity.id)}
                  onExpress={() => handleExpress(m.opportunity.id)}
                  highlight
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold mb-4">All other opportunities</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherOpportunities.map((m) => (
              <OpportunityCard
                key={m.opportunity.id}
                match={m}
                expressed={expressedIds.has(m.opportunity.id)}
                onExpress={() => handleExpress(m.opportunity.id)}
              />
            ))}
          </div>
        </div>

        {expressions.length > 0 && (
          <div className="font-mono text-[11px] opacity-50">
            {expressions.length} interest{expressions.length === 1 ? "" : "s"} expressed so far this session.
          </div>
        )}
      </main>
    </div>
  );
}

function OpportunityCard({
  match,
  expressed,
  onExpress,
  highlight,
}: {
  match: MatchedOpportunity;
  expressed: boolean;
  onExpress: () => void;
  highlight?: boolean;
}) {
  const { opportunity, reasons } = match;
  return (
    <div
      className={`rounded-sm border bg-white p-6 flex flex-col gap-3 ${
        highlight ? "border-ekiti-gold" : "border-ekiti-neutral/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-ekiti-green">
          {OPPORTUNITY_KIND_LABELS[opportunity.kind]}
        </span>
        <span className="flex items-center gap-1 text-[11px] font-mono opacity-60">
          <MapPin size={12} /> {opportunity.location}
        </span>
      </div>

      <h3 className="font-display text-lg font-semibold">{opportunity.title}</h3>
      <p className="text-sm opacity-75 leading-relaxed">{opportunity.description}</p>

      <div className="flex items-center justify-between text-sm pt-2 border-t border-ekiti-neutral/10">
        <span className="font-semibold text-ekiti-green">{opportunity.rewardDescription}</span>
        <span className="text-xs font-mono opacity-60">{opportunity.deadline}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {reasons.map((r) => (
          <span key={r} className="text-[11px] px-2 py-1 rounded-full bg-[#EAF2ED] text-ekiti-green">
            {r}
          </span>
        ))}
      </div>

      {expressed ? (
        <div className="min-h-[44px] flex items-center justify-center gap-2 rounded-sm bg-[#EAF2ED] text-ekiti-green text-sm font-semibold">
          <CheckCircle2 size={14} /> Interest expressed
        </div>
      ) : (
        <button
          type="button"
          onClick={onExpress}
          className="min-h-[44px] rounded-sm bg-ekiti-neutral text-white text-sm font-semibold"
        >
          Express interest
        </button>
      )}
    </div>
  );
}
