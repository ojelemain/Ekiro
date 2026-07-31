"use client";

import React, { useState } from "react";
import { Award, BarChart3, CheckCircle2, HeartHandshake, MapPin, School, Sparkles, UserPlus } from "lucide-react";
import { useIdentity } from "@/context/IdentityContext";
import {
  useTalentEngine,
  TALENT_CATEGORIES,
  type TalentCategory,
  type NominatorType,
} from "@/context/TalentEngineContext";
import IdentityGate from "@/components/identity/IdentityGate";

const inputClass =
  "w-full min-h-[52px] px-3.5 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none focus:border-ekiti-gold";
const textareaClass =
  "w-full px-3.5 py-3 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none focus:border-ekiti-gold";

type Tab = "directory" | "create" | "nominate";

export default function TalentEngine() {
  const { isVerified } = useIdentity();
  const [tab, setTab] = useState<Tab>("directory");

  if (!isVerified) return <IdentityGate />;

  return (
    <div className="min-h-screen bg-ekiti-canvas">
      <header className="px-5 sm:px-10 py-6 border-b border-ekiti-neutral/10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-ekiti-green mb-1">Talent Engine</div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">Every gift counted, not just every job</h1>
        <p className="text-xs opacity-60 mt-1 max-w-xl">
          Artisans, farmers, musicians, athletes, coders, teachers, and inventors — not only professionals.
          Schools and communities can nominate someone; anyone can list themselves.
        </p>
      </header>

      <div className="px-5 sm:px-10 pt-5 flex gap-2 flex-wrap">
        <TabButton active={tab === "directory"} onClick={() => setTab("directory")} icon={BarChart3} label="Talent Directory" />
        <TabButton active={tab === "create"} onClick={() => setTab("create")} icon={UserPlus} label="Create My Profile" />
        <TabButton active={tab === "nominate"} onClick={() => setTab("nominate")} icon={School} label="Nominate Someone" />
      </div>

      <main className="px-5 sm:px-10 py-6">
        {tab === "directory" && <TalentDirectory />}
        {tab === "create" && <CreateProfile onDone={() => setTab("directory")} />}
        {tab === "nominate" && <NominateSomeone onDone={() => setTab("directory")} />}
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
  icon: typeof BarChart3;
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

function TalentDirectory() {
  const { talents, categoryBreakdown, expressMentorshipInterest } = useTalentEngine();
  const [category, setCategory] = useState<TalentCategory | "all">("all");
  const [interestSent, setInterestSent] = useState<Record<string, boolean>>({});

  const filtered = category === "all" ? talents : talents.filter((t) => t.category === category);

  const handleMentor = (talentId: string) => {
    expressMentorshipInterest(talentId);
    setInterestSent((prev) => ({ ...prev, [talentId]: true }));
  };

  return (
    <div>
      <div className="rounded-sm border border-ekiti-neutral/10 bg-white p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-ekiti-green" />
          <span className="text-sm font-semibold">Talent pool breakdown — visible to Living State Dashboard</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categoryBreakdown.map((c) => (
            <span key={c.category} className="text-xs px-2.5 py-1 rounded-full bg-[#EAF2ED] text-ekiti-green font-mono">
              {c.category}: {c.count}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`px-3 py-2 rounded-full text-xs font-semibold ${
            category === "all" ? "bg-ekiti-neutral text-white" : "border border-ekiti-neutral/20"
          }`}
        >
          All talents
        </button>
        {TALENT_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`px-3 py-2 rounded-full text-xs font-semibold ${
              category === c ? "bg-ekiti-neutral text-white" : "border border-ekiti-neutral/20"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((t) => (
          <div key={t.id} className="rounded-sm border border-ekiti-neutral/10 bg-white p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-ekiti-green">{t.category}</span>
              {t.nominatedBy !== "self" && (
                <span className="flex items-center gap-1 text-[11px] text-ekiti-gold font-semibold">
                  <Sparkles size={12} /> Endorsed
                </span>
              )}
            </div>
            <h3 className="font-display text-lg font-semibold">{t.ownerName}</h3>
            <p className="text-sm font-medium opacity-90">{t.headline}</p>
            <p className="text-sm opacity-70 leading-relaxed">{t.description}</p>
            <div className="flex items-center gap-1.5 text-xs font-mono opacity-60">
              <MapPin size={12} /> {t.lgaName}
            </div>
            {t.nominatorName && (
              <div className="text-xs font-mono opacity-50">Nominated by {t.nominatorName}</div>
            )}
            {interestSent[t.id] ? (
              <div className="min-h-[44px] flex items-center justify-center gap-2 rounded-sm bg-[#EAF2ED] text-ekiti-green text-sm font-semibold">
                <CheckCircle2 size={14} /> Mentorship interest sent
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleMentor(t.id)}
                className="min-h-[44px] rounded-sm border border-ekiti-neutral/20 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <HeartHandshake size={15} /> Express mentorship interest
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateProfile({ onDone }: { onDone: () => void }) {
  const { createTalentProfile } = useTalentEngine();
  const [category, setCategory] = useState<TalentCategory>("Artisan");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [lgaName, setLgaName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!ownerName.trim() || !headline.trim() || !description.trim() || !lgaName.trim()) return;
    const created = await createTalentProfile({ ownerName, category, headline, description, lgaName });
    if (created) setDone(true);
  };

  if (done) {
    return (
      <div className="max-w-md flex flex-col items-center text-center gap-3 py-10 mx-auto">
        <CheckCircle2 size={40} className="text-ekiti-green" />
        <h2 className="font-display text-xl font-semibold">You're on the Talent Directory</h2>
        <p className="text-sm opacity-70">
          Diaspora mentors and community members can now find and support you. Schools or community leaders can
          also endorse your profile later.
        </p>
        <button type="button" onClick={onDone} className="mt-2 min-h-[52px] px-6 rounded-sm bg-ekiti-gold text-ekiti-neutral font-semibold">
          View directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <Award size={18} className="text-ekiti-green" />
        <h2 className="font-display text-lg font-semibold">List your talent</h2>
      </div>

      <Field label="Your name">
        <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputClass} />
      </Field>

      <div>
        <div className="text-sm font-semibold mb-2">Category</div>
        <div className="flex flex-wrap gap-2">
          {TALENT_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-full text-xs font-semibold ${
                category === c ? "bg-ekiti-neutral text-white" : "border border-ekiti-neutral/20"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <Field label="Headline (one line)">
        <input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="e.g. Self-taught mobile app developer"
          className={inputClass}
        />
      </Field>

      <Field label="Tell us more">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={textareaClass} />
      </Field>

      <Field label="LGA">
        <input value={lgaName} onChange={(e) => setLgaName(e.target.value)} placeholder="e.g. Ado-Ekiti" className={inputClass} />
      </Field>

      <button type="button" onClick={submit} className="mt-1 min-h-[52px] rounded-sm bg-ekiti-gold text-ekiti-neutral font-semibold">
        List me on the Talent Directory
      </button>
    </div>
  );
}

function NominateSomeone({ onDone }: { onDone: () => void }) {
  const { nominateTalent } = useTalentEngine();
  const [nominatorType, setNominatorType] = useState<NominatorType>("school");
  const [nominatorName, setNominatorName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [category, setCategory] = useState<TalentCategory>("Academic Excellence");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [lgaName, setLgaName] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!nominatorName.trim() || !ownerName.trim() || !headline.trim() || !description.trim() || !lgaName.trim()) return;
    const created = await nominateTalent({ nominatorType, nominatorName, ownerName, category, headline, description, lgaName });
    if (created) setDone(true);
  };

  if (done) {
    return (
      <div className="max-w-md flex flex-col items-center text-center gap-3 py-10 mx-auto">
        <CheckCircle2 size={40} className="text-ekiti-green" />
        <h2 className="font-display text-xl font-semibold">Nomination submitted</h2>
        <p className="text-sm opacity-70">
          {ownerName} now appears on the Talent Directory, endorsed by {nominatorName}.
        </p>
        <button type="button" onClick={onDone} className="mt-2 min-h-[52px] px-6 rounded-sm bg-ekiti-gold text-ekiti-neutral font-semibold">
          View directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <School size={18} className="text-ekiti-green" />
        <h2 className="font-display text-lg font-semibold">Nominate a gifted individual</h2>
      </div>
      <p className="text-sm opacity-70">
        Nominations from schools and community leaders carry an endorsement badge, giving the person more
        visibility than a self-listing.
      </p>

      <div>
        <div className="text-sm font-semibold mb-2">You're nominating as</div>
        <div className="flex gap-2">
          {(["school", "community"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setNominatorType(t)}
              className={`flex-1 min-h-[48px] rounded-sm text-sm font-semibold capitalize ${
                nominatorType === t ? "bg-ekiti-neutral text-white" : "border border-ekiti-neutral/20"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <Field label={nominatorType === "school" ? "School name" : "Community organization name"}>
        <input value={nominatorName} onChange={(e) => setNominatorName(e.target.value)} className={inputClass} />
      </Field>

      <Field label="Nominee's name">
        <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputClass} />
      </Field>

      <div>
        <div className="text-sm font-semibold mb-2">Category</div>
        <div className="flex flex-wrap gap-2">
          {TALENT_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-full text-xs font-semibold ${
                category === c ? "bg-ekiti-neutral text-white" : "border border-ekiti-neutral/20"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <Field label="Headline (one line)">
        <input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="e.g. Top score in state mathematics olympiad"
          className={inputClass}
        />
      </Field>

      <Field label="Why they deserve recognition">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={textareaClass} />
      </Field>

      <Field label="LGA">
        <input value={lgaName} onChange={(e) => setLgaName(e.target.value)} placeholder="e.g. Ikere-Ekiti" className={inputClass} />
      </Field>

      <button type="button" onClick={submit} className="mt-1 min-h-[52px] rounded-sm bg-ekiti-gold text-ekiti-neutral font-semibold">
        Submit nomination
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold mb-2">{label}</div>
      {children}
    </div>
  );
}
