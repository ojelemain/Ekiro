import { Request, Response } from "express";
import { Opportunity, InterestExpression } from "../models/Opportunity";
import { Worker } from "../models/Jobs";
import { Wallet } from "../models/Wallet";
import { EkitiId } from "../models/EkitiId";

const JOB_CATEGORY_LABELS: Record<string, string> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  tailoring: "Tailoring",
  catering: "Catering",
  mechanic: "Mechanic",
  tutoring: "Digital Skills Tutoring",
  tax_helper: "Tax Registration Helper",
};

export async function listOpportunities(req: Request, res: Response) {
  const opportunities = await Opportunity.find();
  res.json(opportunities);
}

// Rule-based matching, ported directly from context/OpportunityEngineContext.tsx
// so behavior stays identical whether computed client-side or server-side.
export async function getMatches(req: Request, res: Response) {
  const { ekitiId, interests } = req.query;
  const interestList: string[] = typeof interests === "string" ? interests.split(",").filter(Boolean) : [];

  let civicScore = 0;
  let isIndigeneVerified = false;
  let mySkillLabels = new Set<string>(interestList);

  if (typeof ekitiId === "string") {
    const wallet = await Wallet.findOne({ ekitiId });
    civicScore = wallet?.civicScore ?? 0;

    const identity = await EkitiId.findById(ekitiId);
    isIndigeneVerified = identity?.status === "verified" && identity?.verificationPath === "indigene";

    const myWorkers = await Worker.find({ ekitiId });
    myWorkers.forEach((w) => mySkillLabels.add(JOB_CATEGORY_LABELS[w.category] ?? w.category));
  }

  const opportunities = await Opportunity.find();

  const matches = opportunities
    .map((opportunity) => {
      let score = 0;
      const reasons: string[] = [];

      const skillOverlap = opportunity.requiredSkills.filter((s) => mySkillLabels.has(s));
      if (opportunity.requiredSkills.length === 0) {
        score += 15;
        reasons.push("Open to anyone — no specific skill required");
      } else if (skillOverlap.length > 0) {
        score += 40;
        reasons.push(`Matches your interest in ${skillOverlap.join(", ")}`);
      }

      if (civicScore >= opportunity.minCivicScore) {
        score += 20;
        if (opportunity.minCivicScore > 0) reasons.push(`Meets the ${opportunity.minCivicScore}+ civic score requirement`);
      } else {
        score -= 30;
        reasons.push(`Needs civic score ${opportunity.minCivicScore}+ (you have ${civicScore})`);
      }

      if (opportunity.requiresIndigene) {
        if (isIndigeneVerified) {
          score += 15;
          reasons.push("You're eligible as a verified Ekiti indigene");
        } else {
          score -= 50;
          reasons.push("Requires Indigene Verification");
        }
      }

      const lowerDeadline = opportunity.deadline.toLowerCase();
      if (lowerDeadline.includes("closes") || lowerDeadline.includes("saturday")) {
        score += 5;
        reasons.push(`Time-sensitive: ${opportunity.deadline}`);
      }

      return { opportunity, score, reasons };
    })
    .sort((a, b) => b.score - a.score);

  res.json(matches);
}

export async function expressInterest(req: Request, res: Response) {
  try {
    const { opportunityId, citizenEkitiId } = req.body;
    const expression = await InterestExpression.create({ opportunity: opportunityId, citizenEkitiId });
    res.status(201).json(expression);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function listExpressions(req: Request, res: Response) {
  const expressions = await InterestExpression.find().sort({ createdAt: -1 });
  res.json(expressions);
}
