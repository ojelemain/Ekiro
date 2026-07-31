"use client";

import React, { useState } from "react";
import { AlertCircle, Send, Sparkles } from "lucide-react";
import { useIdentity } from "@/context/IdentityContext";
import { useJobs } from "@/context/JobsContext";
import { useTeachingHub } from "@/context/TeachingHubContext";
import { useTalentEngine } from "@/context/TalentEngineContext";
import { useOpportunityEngine } from "@/context/OpportunityEngineContext";
import { useDiasporaEngine } from "@/context/DiasporaEngineContext";
import { useInnovationEngine } from "@/context/InnovationEngineContext";
import { usePriceTransparency } from "@/context/PriceTransparencyContext";
import IdentityGate from "@/components/identity/IdentityGate";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const SUGGESTED_QUESTIONS = [
  "Which LGA has the highest IGR?",
  "Which roads have the most reports?",
  "Which talent category is strongest right now?",
  "How many workers are listed on the Jobs Marketplace?",
  "How much has the diaspora contributed?",
  "How many innovation challenges are open?",
];

export default function EkitiAI() {
  const { isVerified } = useIdentity();
  const { workers, bookings } = useJobs();
  const { masters, applications } = useTeachingHub();
  const { categoryBreakdown, lgaBreakdown } = useTalentEngine();
  const { opportunities } = useOpportunityEngine();
  const { totalContributedNaira } = useDiasporaEngine();
  const { challenges, submissions } = useInnovationEngine();
  const { reports } = usePriceTransparency();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isVerified) return <IdentityGate />;

  const buildContext = () => ({
    talentCategoryBreakdown: categoryBreakdown,
    talentLgaBreakdown: lgaBreakdown,
    workersListed: workers.length,
    bookingsCompleted: bookings.filter((b) => b.status === "completed").length,
    activeMasters: masters.length,
    apprenticesTraining: applications.filter((a) => a.status === "training").length,
    apprenticesGraduated: applications.filter((a) => a.status === "graduated").length,
    opportunitiesTracked: opportunities.length,
    openInnovationChallenges: challenges.length,
    innovationWinnersDeclared: submissions.filter((s) => s.isWinner).length,
    totalDiasporaContributedNaira: totalContributedNaira,
    overchargeReportCount: reports.length,
  });

  const ask = async (question: string) => {
    if (!question.trim() || loading) return;
    const userMessage: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ekiti-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context: buildContext() }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", text: data.answer ?? "No response received." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", text: "Something went wrong reaching Ekiti AI. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ekiti-canvas flex flex-col">
      <header className="px-5 sm:px-10 py-6 border-b border-ekiti-neutral/10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-ekiti-green mb-1">Ekiti AI</div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">Ask about the state, in plain language</h1>
      </header>

      <div className="mx-5 sm:mx-10 mt-5 rounded-sm bg-[#FFF8E7] border border-ekiti-gold/40 px-4 py-3 flex items-start gap-2.5">
        <AlertCircle size={16} className="text-ekiti-neutral mt-0.5 flex-shrink-0" />
        <p className="text-xs leading-relaxed">
          <strong>This is a scaffold, not a trained model.</strong> It answers a fixed set of question patterns
          using real data from this session — it doesn't understand free-form questions the way a real language
          model would. Swapping in an actual model is a documented, narrow change in{" "}
          <code className="font-mono">app/api/ekiti-ai/route.ts</code>.
        </p>
      </div>

      <main className="flex-1 px-5 sm:px-10 py-6 flex flex-col gap-4 max-w-2xl w-full mx-auto">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold mb-1">
              <Sparkles size={15} className="text-ekiti-green" /> Try asking
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => ask(q)}
                  className="px-3 py-2 rounded-full text-xs font-medium border border-ekiti-neutral/20 hover:border-ekiti-gold text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col gap-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] px-4 py-3 rounded-sm text-sm leading-relaxed ${
                m.role === "user"
                  ? "self-end bg-ekiti-neutral text-white"
                  : "self-start bg-white border border-ekiti-neutral/10"
              }`}
            >
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="self-start px-4 py-3 rounded-sm text-sm bg-white border border-ekiti-neutral/10 opacity-60">
              Thinking…
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") ask(input);
            }}
            placeholder="Ask about IGR, infrastructure, talent, jobs, diaspora..."
            className="flex-1 min-h-[52px] px-4 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none focus:border-ekiti-gold"
          />
          <button
            type="button"
            onClick={() => ask(input)}
            disabled={loading || !input.trim()}
            className="min-h-[52px] px-5 rounded-sm bg-ekiti-gold text-ekiti-neutral font-semibold disabled:opacity-40 flex items-center gap-2"
          >
            <Send size={16} /> Ask
          </button>
        </div>
      </main>
    </div>
  );
}
