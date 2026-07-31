import { Request, Response } from "express";
import { Wallet } from "../models/Wallet";
import { Worker, Booking } from "../models/Jobs";
import { Master } from "../models/TeachingHub";
import { TalentProfile } from "../models/Talent";
import { Contribution } from "../models/Diaspora";
import { REPUTATION_TIERS, getTierForScore, getNextTier } from "../config/reputationTiers";

export type { ReputationTier } from "../config/reputationTiers";
export { REPUTATION_TIERS };

export async function getReputation(req: Request, res: Response) {
  const ekitiId = req.params.ekitiId;

  const wallet = await Wallet.findOne({ ekitiId });
  if (!wallet) return res.status(404).json({ error: "Wallet not found." });

  const civicScore = wallet.civicScore;
  const currentTier = getTierForScore(civicScore);
  const nextTier = getNextTier(civicScore);
  const progressPercent = nextTier
    ? Math.min(100, Math.round(((civicScore - currentTier.minScore) / (nextTier.minScore - currentTier.minScore)) * 100))
    : 100;

  const myWorkers = await Worker.find({ ekitiId });
  const myWorkerIds = myWorkers.map((w) => w._id);
  const isMaster = (await Master.countDocuments({ worker: { $in: myWorkerIds } })) > 0;
  const hasCompletedBooking = (await Booking.countDocuments({ worker: { $in: myWorkerIds }, status: "completed" })) > 0;
  const hasListedTalent = (await TalentProfile.countDocuments({ ownerEkitiId: ekitiId })) > 0;
  const hasDiasporaContribution = (await Contribution.countDocuments({ diasporaEkitiId: ekitiId })) > 0;

  const badges = [
    { id: "verified-citizen", label: "Verified Citizen", description: "Completed Ekiti ID verification.", earned: true },
    {
      id: "income-earner",
      label: "Income Earner",
      description: "Completed at least one paid booking on the Jobs Marketplace.",
      earned: hasCompletedBooking,
    },
    { id: "mentor", label: "Mentor", description: "Opened apprentice slots as a Teaching Hub Master.", earned: isMaster },
    {
      id: "talent-registered",
      label: "Recognized Talent",
      description: "Listed or been nominated for the Talent Directory.",
      earned: hasListedTalent,
    },
    {
      id: "diaspora-supporter",
      label: "Diaspora Supporter",
      description: "Funded a project or mentored someone through the Diaspora Engine.",
      earned: hasDiasporaContribution,
    },
  ];

  res.json({ civicScore, currentTier, nextTier, progressPercent, badges });
}
