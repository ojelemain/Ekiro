import { Request, Response } from "express";
import { InnovationChallenge, Submission } from "../models/Innovation";
import { Wallet } from "../models/Wallet";
import { STATE_HONOREE_SCORE } from "../config/reputationTiers";

export async function listChallenges(req: Request, res: Response) {
  const challenges = await InnovationChallenge.find();
  res.json(challenges);
}

export async function listSubmissionsForChallenge(req: Request, res: Response) {
  const submissions = await Submission.find({ challenge: req.params.challengeId }).sort({ endorsements: -1 });
  res.json(submissions);
}

export async function submitSolution(req: Request, res: Response) {
  try {
    const submission = await Submission.create({ ...req.body, challenge: req.params.challengeId });
    res.status(201).json(submission);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function endorseSubmission(req: Request, res: Response) {
  try {
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { $inc: { endorsements: 1 } },
      { new: true }
    );
    if (!submission) return res.status(404).json({ error: "Submission not found." });
    res.json(submission);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

// Judging is reputation-gated server-side, not just hidden in the UI: only a
// State Honoree (850+ civic score) can declare a winner.
export async function declareWinner(req: Request, res: Response) {
  try {
    const { judgeEkitiId } = req.body;
    const judgeWallet = await Wallet.findOne({ ekitiId: judgeEkitiId });
    if (!judgeWallet || judgeWallet.civicScore < STATE_HONOREE_SCORE) {
      return res.status(403).json({
        error: `Only State Honoree tier (${STATE_HONOREE_SCORE}+ civic score) can declare a winner.`,
      });
    }

    const submission = await Submission.findByIdAndUpdate(req.params.id, { isWinner: true }, { new: true });
    if (!submission) return res.status(404).json({ error: "Submission not found." });
    res.json(submission);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}
