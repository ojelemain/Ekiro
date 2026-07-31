import { Request, Response } from "express";
import { FundableProject, Contribution } from "../models/Diaspora";
import { EkitiId } from "../models/EkitiId";

function generateImpactNote(type: string, targetTitle: string): string {
  const notes: Record<string, string> = {
    mentorship: `Mentorship session scheduled with ${targetTitle}. Progress updates will appear here as sessions complete.`,
    education_sponsorship: `Tuition sponsorship applied to ${targetTitle}. Enrollment confirmation expected within 14 days.`,
    sme_investment: `Investment recorded against ${targetTitle}. Revenue-share reporting begins next settlement cycle.`,
    infrastructure_funding: `Funds earmarked for ${targetTitle}. Work order will be issued once the target amount is reached.`,
    healthcare_support: `Supplies funded for ${targetTitle}. Delivery confirmation expected within 30 days.`,
    school_adoption: `Adoption registered for ${targetTitle}. A termly report will be shared with you directly.`,
    equipment_contribution: `Equipment funding recorded for ${targetTitle}. Procurement begins once fully funded.`,
    innovation_challenge: `Contribution added to the prize pool for ${targetTitle}. The winning solution's funding increases accordingly.`,
  };
  return notes[type] ?? "Contribution recorded.";
}

export async function listProjects(req: Request, res: Response) {
  const projects = await FundableProject.find();
  res.json(projects);
}

// Reserved for verified diaspora indigenes — checked here, not just in the UI.
async function requireDiasporaIndigene(ekitiId: string): Promise<{ ok: boolean; reason?: string }> {
  const identity = await EkitiId.findById(ekitiId);
  if (!identity) return { ok: false, reason: "Identity not found." };
  if (identity.verificationPath !== "indigene") {
    return { ok: false, reason: "Requires Indigene Verification, not just Resident Access." };
  }
  if (identity.residency !== "diaspora") {
    return { ok: false, reason: "Reserved for indigenes currently living abroad." };
  }
  return { ok: true };
}

export async function fundProject(req: Request, res: Response) {
  try {
    const { projectId, amountNaira, diasporaEkitiId, diasporaName } = req.body;

    const eligibility = await requireDiasporaIndigene(diasporaEkitiId);
    if (!eligibility.ok) return res.status(403).json({ error: eligibility.reason });

    const project = await FundableProject.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found." });
    if (!Number.isFinite(amountNaira) || amountNaira <= 0) {
      return res.status(400).json({ error: "Enter a valid amount." });
    }

    project.raisedNaira += amountNaira;
    await project.save();

    const contribution = await Contribution.create({
      type: project.type,
      targetId: project._id,
      targetTitle: project.title,
      amountNaira,
      diasporaEkitiId,
      diasporaName,
      impactNote: generateImpactNote(project.type, project.title),
    });

    res.status(201).json({ project, contribution });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function mentorTalent(req: Request, res: Response) {
  try {
    const { talentId, talentName, diasporaEkitiId, diasporaName } = req.body;

    const eligibility = await requireDiasporaIndigene(diasporaEkitiId);
    if (!eligibility.ok) return res.status(403).json({ error: eligibility.reason });

    const contribution = await Contribution.create({
      type: "mentorship",
      targetId: talentId,
      targetTitle: talentName,
      amountNaira: null,
      diasporaEkitiId,
      diasporaName,
      impactNote: generateImpactNote("mentorship", talentName),
    });

    res.status(201).json(contribution);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function listContributions(req: Request, res: Response) {
  const { diasporaEkitiId } = req.query;
  const filter = diasporaEkitiId ? { diasporaEkitiId } : {};
  const contributions = await Contribution.find(filter).sort({ createdAt: -1 });
  res.json(contributions);
}
