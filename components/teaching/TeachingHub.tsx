"use client";

import React, { useState } from "react";
import { CheckCircle2, GraduationCap, Search, Users } from "lucide-react";
import { useIdentity } from "@/context/IdentityContext";
import { useWallet } from "@/context/WalletContext";
import { VERIFIED_PROFESSIONAL_SCORE } from "@/context/ReputationContext";
import { useJobs, JOB_CATEGORIES, type JobCategory } from "@/context/JobsContext";
import {
  useTeachingHub,
  MASTER_ELIGIBLE_JOBS_THRESHOLD,
  GRADUATION_JOBS_THRESHOLD,
  APPRENTICE_SPLIT,
  MASTER_SPLIT,
} from "@/context/TeachingHubContext";
import IdentityGate from "@/components/identity/IdentityGate";

type Tab = "apply" | "become" | "progress";

export default function TeachingHub() {
  const { isVerified, profile } = useIdentity();
  const [tab, setTab] = useState<Tab>("apply");

  if (!isVerified) return <IdentityGate />;

  return (
    <div className="min-h-screen bg-ekiti-canvas">
      <header className="px-5 sm:px-10 py-6 border-b border-ekiti-neutral/10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-ekiti-green mb-1">Teaching Hub</div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium">Learn a skill under a verified Master</h1>
        <p className="text-xs opacity-60 mt-1 max-w-xl">
          No literacy or experience required to start. Apprentices split supervised jobs {Math.round(APPRENTICE_SPLIT * 100)}/
          {Math.round(MASTER_SPLIT * 100)} with their Master and graduate to their own listing after{" "}
          {GRADUATION_JOBS_THRESHOLD} completed supervised jobs.
        </p>
      </header>

      <div className="px-5 sm:px-10 pt-5 flex gap-2 flex-wrap">
        <TabButton active={tab === "apply"} onClick={() => setTab("apply")} icon={Search} label="Find a Master" />
        <TabButton active={tab === "become"} onClick={() => setTab("become")} icon={Users} label="Become a Master" />
        <TabButton active={tab === "progress"} onClick={() => setTab("progress")} icon={GraduationCap} label="Track progress" />
      </div>

      <main className="px-5 sm:px-10 py-6">
        {tab === "apply" && <FindAMaster applicantName={profile.fullName || "New apprentice"} />}
        {tab === "become" && <BecomeAMaster onDone={() => setTab("progress")} />}
        {tab === "progress" && <TrackProgress />}
      </main>
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
  icon: typeof Search;
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

function FindAMaster({ applicantName }: { applicantName: string }) {
  const { masters, applyForApprenticeship } = useTeachingHub();
  const [category, setCategory] = useState<JobCategory | "all">("all");
  const [appliedMessage, setAppliedMessage] = useState<Record<string, string>>({});

  const filtered = category === "all" ? masters : masters.filter((m) => m.category === category);

  const handleApply = async (masterId: string, masterCategory: JobCategory) => {
    const application = await applyForApprenticeship(applicantName, masterCategory, masterId);
    setAppliedMessage((prev) => ({
      ...prev,
      [masterId]: application ? "Application sent — check Track progress" : "This Master has no open slots right now",
    }));
  };

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`px-3 py-2 rounded-full text-xs font-semibold ${
            category === "all" ? "bg-ekiti-neutral text-white" : "border border-ekiti-neutral/20"
          }`}
        >
          All skills
        </button>
        {JOB_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategory(c.key)}
            className={`px-3 py-2 rounded-full text-xs font-semibold ${
              category === c.key ? "bg-ekiti-neutral text-white" : "border border-ekiti-neutral/20"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((m) => {
          const full = m.activeApprentices >= m.apprenticeSlots;
          return (
            <div key={m.id} className="rounded-sm border border-ekiti-neutral/10 bg-white p-6 flex flex-col gap-3">
              <div>
                <h3 className="font-display text-lg font-medium">{m.name}</h3>
                <span className="text-xs font-mono opacity-60">
                  {JOB_CATEGORIES.find((c) => c.key === m.category)?.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono opacity-70">
                <Users size={13} /> {m.activeApprentices}/{m.apprenticeSlots} apprentice slots filled
              </div>
              {appliedMessage[m.id] ? (
                <div className="min-h-[48px] flex items-center justify-center rounded-sm bg-[#EAF2ED] text-ekiti-green text-sm font-semibold text-center px-3">
                  {appliedMessage[m.id]}
                </div>
              ) : (
                <button
                  type="button"
                  disabled={full}
                  onClick={() => handleApply(m.id, m.category)}
                  className="min-h-[48px] rounded-sm bg-ekiti-neutral text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {full ? "No slots available" : "Apply to train"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BecomeAMaster({ onDone }: { onDone: () => void }) {
  const { workers } = useJobs();
  const { civicScore } = useWallet();
  const { becomeMaster } = useTeachingHub();
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [slots, setSlots] = useState("2");
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const qualifiesByReputation = civicScore >= VERIFIED_PROFESSIONAL_SCORE;
  const eligibleWorkers = workers.filter(
    (w) => w.completedJobs >= MASTER_ELIGIBLE_JOBS_THRESHOLD || qualifiesByReputation
  );

  const submit = async () => {
    if (!selectedWorkerId) {
      setMessage("Choose which worker profile becomes a Master.");
      return;
    }
    const result = await becomeMaster(selectedWorkerId, Number(slots) || 1, qualifiesByReputation);
    if (result.success) {
      setSuccess(true);
    } else {
      setMessage(result.reason ?? "Unable to open apprentice slots right now.");
    }
  };

  if (success) {
    return (
      <div className="max-w-md flex flex-col items-center text-center gap-3 py-10 mx-auto">
        <CheckCircle2 size={40} className="text-ekiti-green" />
        <h2 className="font-display text-xl font-medium">You're now a Master</h2>
        <p className="text-sm opacity-70">
          Apprentices can apply to train under you. You earn {Math.round(MASTER_SPLIT * 100)}% of every supervised
          job until each apprentice graduates — then they get their own independent listing.
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-2 min-h-[52px] px-6 rounded-sm bg-ekiti-gold text-ekiti-neutral font-semibold"
        >
          Track apprentices
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <Users size={18} className="text-ekiti-green" />
        <h2 className="font-display text-lg font-medium">Open apprentice slots</h2>
      </div>
      <p className="text-sm opacity-70">
        You need at least {MASTER_ELIGIBLE_JOBS_THRESHOLD} completed jobs on a worker profile to qualify as a
        Master — or reach Verified Professional civic reputation ({VERIFIED_PROFESSIONAL_SCORE}+ civic score),
        which qualifies any of your worker profiles instead. Either path proves you're trusted enough to vouch
        for someone new.
      </p>

      {eligibleWorkers.length === 0 ? (
        <div className="rounded-sm bg-[#FFF8E7] p-4 text-sm">
          None of your worker profiles have reached {MASTER_ELIGIBLE_JOBS_THRESHOLD} completed jobs, and your
          civic score hasn't reached Verified Professional yet. Keep completing bookings or civic tasks first.
        </div>
      ) : (
        <>
          {qualifiesByReputation && (
            <div className="rounded-sm bg-[#EAF2ED] text-ekiti-green p-3 text-xs font-semibold">
              Qualifying via Verified Professional civic reputation — no job-count minimum required.
            </div>
          )}
          <div>
            <div className="text-sm font-semibold mb-2">Which profile qualifies?</div>
            <div className="flex flex-col gap-2">
              {eligibleWorkers.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSelectedWorkerId(w.id)}
                  className={`px-4 py-3 rounded-sm text-sm text-left ${
                    selectedWorkerId === w.id ? "border border-ekiti-gold bg-[#FFF8E7]" : "border border-ekiti-neutral/15 bg-white"
                  }`}
                >
                  {w.name} · {JOB_CATEGORIES.find((c) => c.key === w.category)?.label} · {w.completedJobs} jobs
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2">How many apprentices can you supervise at once?</div>
            <input
              value={slots}
              onChange={(e) => setSlots(e.target.value.replace(/\D/g, ""))}
              className="w-full min-h-[52px] px-3.5 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none focus:border-ekiti-gold"
            />
          </div>

          {message && <p className="text-xs text-red-600">{message}</p>}

          <button
            type="button"
            onClick={submit}
            className="mt-1 min-h-[52px] rounded-sm bg-ekiti-gold text-ekiti-neutral font-semibold"
          >
            Open apprentice slots
          </button>
        </>
      )}
    </div>
  );
}

function TrackProgress() {
  const { applications, acceptApplication, rejectApplication, runSupervisedJob } = useTeachingHub();
  const [paidMessage, setPaidMessage] = useState<Record<string, string>>({});

  const handleSupervisedJob = async (applicationId: string) => {
    const grossNaira = 3000 + Math.round(Math.random() * 4000);
    const split = await runSupervisedJob(applicationId, grossNaira);
    if (split) {
      setPaidMessage((prev) => ({
        ...prev,
        [applicationId]: `Job settled: ₦${split.apprenticeShare.toLocaleString()} to apprentice, ₦${split.masterShare.toLocaleString()} to Master`,
      }));
    }
  };

  if (applications.length === 0) {
    return (
      <p className="text-sm opacity-60 max-w-md">
        No apprenticeships yet. Apply to train under a Master, or open your own apprentice slots.
      </p>
    );
  }

  return (
    <div className="max-w-2xl flex flex-col gap-4">
      {applications.map((a) => (
        <div key={a.id} className="rounded-sm border border-ekiti-neutral/10 bg-white p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="font-medium text-sm">{a.applicantName}</div>
              <div className="text-xs font-mono opacity-60">
                Training under {a.masterName} · {JOB_CATEGORIES.find((c) => c.key === a.category)?.label}
              </div>
            </div>
            <StatusBadge status={a.status} />
          </div>

          {a.status !== "graduated" && a.status !== "rejected" && (
            <div>
              <div className="flex items-center justify-between text-xs font-mono opacity-60 mb-1.5">
                <span>Supervised jobs completed</span>
                <span>
                  {a.completedSupervisedJobs}/{GRADUATION_JOBS_THRESHOLD}
                </span>
              </div>
              <div className="h-2 rounded-full bg-ekiti-neutral/10 overflow-hidden">
                <div
                  className="h-full bg-ekiti-gold rounded-full"
                  style={{ width: `${Math.min(100, (a.completedSupervisedJobs / GRADUATION_JOBS_THRESHOLD) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {paidMessage[a.id] && <p className="text-xs text-ekiti-green">{paidMessage[a.id]}</p>}

          <div className="flex gap-2">
            {a.status === "pending" && (
              <>
                <button
                  type="button"
                  onClick={() => acceptApplication(a.id)}
                  className="flex-1 min-h-[44px] rounded-sm bg-ekiti-neutral text-white text-sm font-semibold"
                >
                  Accept apprentice
                </button>
                <button
                  type="button"
                  onClick={() => rejectApplication(a.id)}
                  className="min-h-[44px] px-4 rounded-sm border border-ekiti-neutral/20 text-sm font-semibold"
                >
                  Decline
                </button>
              </>
            )}
            {a.status === "training" && (
              <button
                type="button"
                onClick={() => handleSupervisedJob(a.id)}
                className="flex-1 min-h-[44px] rounded-sm bg-ekiti-gold text-ekiti-neutral text-sm font-semibold"
              >
                Simulate a supervised job
              </button>
            )}
            {a.status === "graduated" && (
              <div className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-sm bg-[#EAF2ED] text-ekiti-green text-sm font-semibold">
                <GraduationCap size={16} /> Graduated — now listed independently
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-[#FFF8E7] text-ekiti-neutral",
    training: "bg-[#EAF2ED] text-ekiti-green",
    graduated: "bg-ekiti-gold text-ekiti-neutral",
    rejected: "bg-red-50 text-red-600",
  };
  return (
    <span className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full ${styles[status] ?? ""}`}>
      {status}
    </span>
  );
}
