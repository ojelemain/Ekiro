import { Request, Response } from "express";
import { TalentProfile, MentorshipInterest } from "../models/Talent";

export async function listTalents(req: Request, res: Response) {
  const { category } = req.query;
  const filter = category ? { category } : {};
  const talents = await TalentProfile.find(filter).sort({ createdAt: -1 });
  res.json(talents);
}

export async function createTalentProfile(req: Request, res: Response) {
  try {
    const talent = await TalentProfile.create({ ...req.body, nominatedBy: "self", isSelf: true });
    res.status(201).json(talent);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function nominateTalent(req: Request, res: Response) {
  try {
    const { nominatorType, nominatorName, ...rest } = req.body;
    const talent = await TalentProfile.create({
      ...rest,
      nominatedBy: nominatorType,
      nominatorName,
      isSelf: true,
    });
    res.status(201).json(talent);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function expressMentorshipInterest(req: Request, res: Response) {
  try {
    const { talentId, mentorEkitiId } = req.body;
    const interest = await MentorshipInterest.create({ talent: talentId, mentorEkitiId });
    res.status(201).json(interest);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

// Category/LGA breakdown for the Living State Dashboard and Talent Directory.
export async function getBreakdown(req: Request, res: Response) {
  const categoryBreakdown = await TalentProfile.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $project: { category: "$_id", count: 1, _id: 0 } },
    { $sort: { count: -1 } },
  ]);
  const lgaBreakdown = await TalentProfile.aggregate([
    { $group: { _id: "$lgaName", count: { $sum: 1 } } },
    { $project: { lgaName: "$_id", count: 1, _id: 0 } },
    { $sort: { count: -1 } },
  ]);
  res.json({ categoryBreakdown, lgaBreakdown });
}
