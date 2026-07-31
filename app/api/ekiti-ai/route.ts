import { NextRequest, NextResponse } from "next/server";
import { LGA_DATA, INFRASTRUCTURE_FAULTS } from "@/lib/ekitiStateFacts";

// ---------------------------------------------------------------------------
// EKITI AI — SCAFFOLD, NOT A TRAINED MODEL
// ---------------------------------------------------------------------------
// This route answers a fixed set of question patterns using real data: the
// static LGA/infrastructure facts above, plus a `context` snapshot the client
// sends built from live React state (talent counts, diaspora totals, etc).
// It is deliberately NOT dressed up to look like a real language model.
//
// TO UPGRADE TO A REAL MODEL LATER:
//   1. Add ANTHROPIC_API_KEY to your environment (Vercel/Railway settings).
//   2. Replace the `answerFromRules(...)` call below with a real call to
//      POST https://api.anthropic.com/v1/messages, passing `question` as the
//      user message and a system prompt built from `context` + the facts
//      above — the same grounding data this rule-based version already uses.
//   3. Everything else (the client component, the request/response shape)
//      stays the same. That's the point of keeping this seam narrow.
// ---------------------------------------------------------------------------

export interface EkitiAiContext {
  talentCategoryBreakdown?: { category: string; count: number }[];
  talentLgaBreakdown?: { lgaName: string; count: number }[];
  workersListed?: number;
  bookingsCompleted?: number;
  activeMasters?: number;
  apprenticesTraining?: number;
  apprenticesGraduated?: number;
  opportunitiesTracked?: number;
  openInnovationChallenges?: number;
  innovationWinnersDeclared?: number;
  totalDiasporaContributedNaira?: number;
  overchargeReportCount?: number;
}

interface RequestBody {
  question: string;
  context?: EkitiAiContext;
}

function answerFromRules(question: string, context: EkitiAiContext | undefined): string {
  const q = question.toLowerCase();

  if (q.includes("highest igr") || (q.includes("igr") && q.includes("highest"))) {
    const top = [...LGA_DATA].sort((a, b) => b.igrNaira - a.igrNaira)[0];
    return `${top.lga} has the highest IGR among the tracked LGAs, at ₦${(top.igrNaira / 1_000_000).toFixed(1)}m with ${top.growthPercent}% year-on-year growth.`;
  }
  if (q.includes("lowest igr") || (q.includes("igr") && q.includes("lowest"))) {
    const bottom = [...LGA_DATA].sort((a, b) => a.igrNaira - b.igrNaira)[0];
    return `${bottom.lga} has the lowest IGR among the tracked LGAs, at ₦${(bottom.igrNaira / 1_000_000).toFixed(1)}m.`;
  }

  const mentionedLga = LGA_DATA.find((l) => q.includes(l.lga.toLowerCase().split("/")[0].split("-")[0]));
  if (mentionedLga && (q.includes("igr") || q.includes("revenue"))) {
    return `${mentionedLga.lga}'s IGR is ₦${(mentionedLga.igrNaira / 1_000_000).toFixed(1)}m, growing at ${mentionedLga.growthPercent}% with ${mentionedLga.activeTaskers} active taskers.`;
  }

  if (q.includes("road") || q.includes("pothole") || q.includes("infrastructure") || q.includes("fault")) {
    const high = INFRASTRUCTURE_FAULTS.filter((f) => f.severity === "High");
    if (high.length === 0) return "No high-severity infrastructure faults are currently logged.";
    return `${high.length} high-severity fault${high.length === 1 ? "" : "s"} currently logged: ${high
      .map((f) => `${f.location} (${f.type}, reported ${f.reportedHoursAgo}h ago)`)
      .join("; ")}.`;
  }

  if (q.includes("talent") || q.includes("artisan") || q.includes("musician") || q.includes("coder")) {
    if (context?.talentCategoryBreakdown?.length) {
      const top = [...context.talentCategoryBreakdown].sort((a, b) => b.count - a.count)[0];
      return `The largest recognized talent category right now is ${top.category} with ${top.count} ${top.count === 1 ? "profile" : "profiles"}. Full breakdown: ${context.talentCategoryBreakdown
        .map((c) => `${c.category} (${c.count})`)
        .join(", ")}.`;
    }
    return "No talent profiles have been recorded in this session yet — visit the Talent Engine to add some.";
  }

  if (q.includes("worker") || q.includes("job") || q.includes("booking")) {
    if (context?.workersListed !== undefined) {
      return `${context.workersListed} worker${context.workersListed === 1 ? "" : "s"} listed on the Jobs Marketplace, with ${context.bookingsCompleted ?? 0} completed booking${(context.bookingsCompleted ?? 0) === 1 ? "" : "s"} so far.`;
    }
  }

  if (q.includes("master") || q.includes("apprentice") || q.includes("teaching hub")) {
    if (context?.activeMasters !== undefined) {
      return `${context.activeMasters} active Master${context.activeMasters === 1 ? "" : "s"} on the Teaching Hub, with ${context.apprenticesTraining ?? 0} apprentice(s) currently training and ${context.apprenticesGraduated ?? 0} graduated.`;
    }
  }

  if (q.includes("diaspora") || q.includes("contribut")) {
    if (context?.totalDiasporaContributedNaira !== undefined) {
      return `Diaspora members have contributed ₦${context.totalDiasporaContributedNaira.toLocaleString()} so far this session across funded projects and mentorships.`;
    }
  }

  if (q.includes("innovation") || q.includes("challenge")) {
    if (context?.openInnovationChallenges !== undefined) {
      return `${context.openInnovationChallenges} open innovation challenge(s), with ${context.innovationWinnersDeclared ?? 0} winner(s) declared so far.`;
    }
  }

  if (q.includes("overcharge") || q.includes("price") || q.includes("hoarding")) {
    if (context?.overchargeReportCount !== undefined) {
      return context.overchargeReportCount > 0
        ? `${context.overchargeReportCount} overcharge report(s) logged this session — check the Living State Dashboard for which batches are flagged.`
        : "No overcharge reports logged this session.";
    }
  }

  return "I don't have a confident answer for that yet — Ekiti AI currently only answers a fixed set of question patterns about IGR, infrastructure, talent, jobs, diaspora contributions, and innovation challenges. A real trained model, wired to live state data, would replace this rule-based responder.";
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const question = (body.question ?? "").trim();
  if (!question) {
    return NextResponse.json({ error: "A question is required." }, { status: 400 });
  }

  const answer = answerFromRules(question, body.context);

  return NextResponse.json({
    answer,
    isRuleBased: true,
    note: "Ekiti AI scaffold response — not a trained model. See app/api/ekiti-ai/route.ts for the upgrade path.",
  });
}
