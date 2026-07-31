"use client";

import React, { useMemo } from "react";
import {
  AlertTriangle,
  Award,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Plane,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { usePriceTransparency } from "@/context/PriceTransparencyContext";
import { useJobs } from "@/context/JobsContext";
import { useTeachingHub } from "@/context/TeachingHubContext";
import { useTalentEngine } from "@/context/TalentEngineContext";
import { useOpportunityEngine } from "@/context/OpportunityEngineContext";
import { useDiasporaEngine } from "@/context/DiasporaEngineContext";
import { useInnovationEngine } from "@/context/InnovationEngineContext";
import { LGA_DATA, INFRASTRUCTURE_FAULTS } from "@/lib/ekitiStateFacts";

function formatNaira(amount: number): string {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}m`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}k`;
  return `₦${amount}`;
}

export default function LivingStateDashboardPage() {
  const { settlements } = useWallet();
  const { reports, diversionFlags } = usePriceTransparency();
  const { workers, bookings } = useJobs();
  const { masters, applications } = useTeachingHub();
  const { categoryBreakdown, lgaBreakdown } = useTalentEngine();
  const { opportunities, expressions } = useOpportunityEngine();
  const { projects, contributions, totalContributedNaira } = useDiasporaEngine();
  const { challenges, submissions } = useInnovationEngine();

  const totals = useMemo(() => {
    const totalIgr = LGA_DATA.reduce((sum, l) => sum + l.igrNaira, 0);
    const totalTaskers = LGA_DATA.reduce((sum, l) => sum + l.activeTaskers, 0);
    const avgGrowth = LGA_DATA.reduce((sum, l) => sum + l.growthPercent, 0) / LGA_DATA.length;
    const platformTreasuryToDate = settlements.reduce((sum, s) => sum + s.treasuryShareNaira, 0);
    const platformTaskerToDate = settlements.reduce((sum, s) => sum + s.taskerShareNaira, 0);
    return { totalIgr, totalTaskers, avgGrowth, platformTreasuryToDate, platformTaskerToDate };
  }, [settlements]);

  const maxIgr = Math.max(...LGA_DATA.map((l) => l.igrNaira));
  const completedBookings = bookings.filter((b) => b.status === "completed").length;
  const trainingCount = applications.filter((a) => a.status === "training").length;
  const graduatedCount = applications.filter((a) => a.status === "graduated").length;
  const winnersDeclared = submissions.filter((s) => s.isWinner).length;

  return (
    <div className="min-h-screen bg-ekiti-neutral text-ekiti-canvas">
      <header className="px-5 sm:px-10 py-6 border-b border-white/10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-ekiti-gold mb-1">
          Living State Dashboard
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">Every sector of Ekiti, one live view</h1>
        <p className="text-xs opacity-60 mt-1 max-w-2xl">
          Revenue, infrastructure, talent, opportunity, learning, diaspora investment, and innovation — the same
          data citizens generate across EKIRO, rolled up here instead of scattered across ministries.
        </p>
      </header>

      <main className="px-5 sm:px-10 py-8 space-y-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBlock icon={TrendingUp} label="Total IGR (6 LGAs)" value={formatNaira(totals.totalIgr)} note={`avg growth +${totals.avgGrowth.toFixed(0)}%`} />
          <StatBlock icon={Users} label="Active taskers" value={totals.totalTaskers.toLocaleString()} note="across all mapped zones" />
          <StatBlock icon={TrendingUp} label="Treasury share to date" value={`₦${totals.platformTreasuryToDate.toLocaleString()}`} note="80% of civic task settlements" />
          <StatBlock icon={TrendingUp} label="Tasker commission to date" value={`₦${totals.platformTaskerToDate.toLocaleString()}`} note="20% of civic task settlements" />
        </section>

        <section className="rounded-sm bg-white/5 border border-white/10 p-6">
          <h2 className="font-display text-lg font-semibold mb-5">IGR growth by Local Government Area</h2>
          <div className="space-y-4">
            {LGA_DATA.map((l) => (
              <div key={l.lga}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium">{l.lga}</span>
                  <span className="font-mono text-xs opacity-70">
                    {formatNaira(l.igrNaira)} · +{l.growthPercent}% · {l.activeTaskers} taskers
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-ekiti-gold rounded-full" style={{ width: `${(l.igrNaira / maxIgr) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBlock icon={Briefcase} label="Workers listed" value={workers.length.toLocaleString()} note="Jobs Marketplace" />
          <StatBlock icon={Briefcase} label="Bookings completed" value={completedBookings.toLocaleString()} note="paid at 100% to worker" />
          <StatBlock icon={GraduationCap} label="Active Masters" value={masters.length.toLocaleString()} note="Teaching Hub" />
          <StatBlock icon={GraduationCap} label="Apprentices" value={`${trainingCount} training · ${graduatedCount} graduated`} note="skills pipeline" />
        </section>

        <section className="rounded-sm bg-white/5 border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-ekiti-gold" />
            <h2 className="font-display text-lg font-semibold">Talent pool, by category and LGA</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {categoryBreakdown.map((c) => (
              <span key={c.category} className="text-xs px-2.5 py-1 rounded-full bg-white/10 font-mono">
                {c.category}: {c.count}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {lgaBreakdown.map((l) => (
              <span key={l.lgaName} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 font-mono opacity-70">
                {l.lgaName}: {l.count}
              </span>
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBlock icon={Lightbulb} label="Opportunities tracked" value={opportunities.length.toLocaleString()} note="jobs, grants, scholarships" />
          <StatBlock icon={Lightbulb} label="Interest expressed" value={expressions.length.toLocaleString()} note="Opportunity Engine" />
          <StatBlock icon={Lightbulb} label="Open innovation challenges" value={challenges.length.toLocaleString()} note="Innovation Engine" />
          <StatBlock icon={Award} label="Winners declared" value={winnersDeclared.toLocaleString()} note={`of ${submissions.length} submissions`} />
        </section>

        <section className="rounded-sm bg-white/5 border border-white/10 p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Plane size={16} className="text-ekiti-gold" />
              <h2 className="font-display text-lg font-semibold">Diaspora contributions</h2>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-widest opacity-60">
              ₦{totalContributedNaira.toLocaleString()} total · {contributions.length} contribution{contributions.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="space-y-3">
            {projects
              .filter((p) => p.targetNaira)
              .map((p) => {
                const percent = Math.min(100, Math.round((p.raisedNaira / (p.targetNaira ?? 1)) * 100));
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium">{p.title}</span>
                      <span className="font-mono text-xs opacity-70">
                        ₦{p.raisedNaira.toLocaleString()} of ₦{(p.targetNaira ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-ekiti-gold rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        <section className="rounded-sm bg-white/5 border border-white/10 p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <h2 className="font-display text-lg font-semibold">Subsidized goods — diversion &amp; overcharge monitoring</h2>
            <span className="font-mono text-[11px] uppercase tracking-widest opacity-60">
              {reports.length} report{reports.length === 1 ? "" : "s"} logged
            </span>
          </div>
          {diversionFlags.length === 0 ? (
            <p className="text-sm opacity-60">No overcharge reports yet. This fills in as citizens use Price Check.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {diversionFlags.map((flag) => (
                <li key={flag.batchCode} className="py-3 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={16} className={flag.reportCount > 1 ? "text-red-400" : "text-ekiti-gold"} />
                    <div>
                      <div className="text-sm font-medium">{flag.itemName}</div>
                      <div className="text-xs font-mono opacity-60">Batch {flag.batchCode}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono">
                      {flag.reportCount} report{flag.reportCount === 1 ? "" : "s"}
                    </div>
                    <div className="text-xs font-mono opacity-60">
                      up to ₦{flag.maxOverchargeNaira.toLocaleString()} over official price
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-sm bg-white/5 border border-white/10 p-6">
          <h2 className="font-display text-lg font-semibold mb-5">Active infrastructure faults</h2>
          <ul className="divide-y divide-white/10">
            {INFRASTRUCTURE_FAULTS.map((f) => (
              <li key={f.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle
                    size={16}
                    className={
                      f.severity === "High" ? "text-red-400" : f.severity === "Medium" ? "text-ekiti-gold" : "text-white/50"
                    }
                  />
                  <div>
                    <div className="text-sm font-medium">{f.location}</div>
                    <div className="text-xs font-mono opacity-60">{f.type}</div>
                  </div>
                </div>
                <div className="text-xs font-mono opacity-60 whitespace-nowrap">{f.reportedHoursAgo}h ago</div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

function StatBlock({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-sm bg-white/5 border border-white/10 p-5">
      <div className="flex items-center gap-2 text-ekiti-gold mb-3">
        <Icon size={16} />
        <span className="font-mono text-[11px] uppercase tracking-widest">{label}</span>
      </div>
      <div className="font-display text-2xl sm:text-3xl font-semibold">{value}</div>
      <div className="text-xs font-mono opacity-60 mt-1">{note}</div>
    </div>
  );
}
