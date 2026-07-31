import { Request, Response } from "express";
import { Master, Apprenticeship } from "../models/TeachingHub";
import { Worker } from "../models/Jobs";
import { Wallet } from "../models/Wallet";
import { VERIFIED_PROFESSIONAL_SCORE } from "../config/reputationTiers";

const MASTER_ELIGIBLE_JOBS_THRESHOLD = 20;
const GRADUATION_JOBS_THRESHOLD = 5;

export async function becomeMaster(req: Request, res: Response) {
  try {
    const { workerId, apprenticeSlots, ekitiId } = req.body;
    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ error: "Worker not found." });

    const wallet = await Wallet.findOne({ ekitiId });
    const qualifiesByReputation = !!wallet && wallet.civicScore >= VERIFIED_PROFESSIONAL_SCORE;

    if (worker.completedJobs < MASTER_ELIGIBLE_JOBS_THRESHOLD && !qualifiesByReputation) {
      return res.status(400).json({
        error: `Need ${MASTER_ELIGIBLE_JOBS_THRESHOLD}+ completed jobs or Verified Professional reputation (${VERIFIED_PROFESSIONAL_SCORE}+ civic score).`,
      });
    }

    const master = await Master.create({
      worker: worker._id,
      apprenticeSlots,
      qualifiedByReputation: qualifiesByReputation && worker.completedJobs < MASTER_ELIGIBLE_JOBS_THRESHOLD,
    });
    res.status(201).json(master);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function applyForApprenticeship(req: Request, res: Response) {
  try {
    const { masterId, applicantEkitiId, applicantName, category } = req.body;
    const master = await Master.findById(masterId);
    if (!master) return res.status(404).json({ error: "Master not found." });
    if (master.activeApprentices >= master.apprenticeSlots) {
      return res.status(400).json({ error: "This Master has no open apprentice slots." });
    }

    const application = await Apprenticeship.create({
      applicantEkitiId,
      applicantName,
      master: master._id,
      category,
      status: "pending",
    });
    res.status(201).json(application);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function acceptApplication(req: Request, res: Response) {
  try {
    const application = await Apprenticeship.findByIdAndUpdate(
      req.params.id,
      { status: "training" },
      { new: true }
    );
    if (!application) return res.status(404).json({ error: "Application not found." });
    await Master.findByIdAndUpdate(application.master, { $inc: { activeApprentices: 1 } });
    res.json(application);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function rejectApplication(req: Request, res: Response) {
  try {
    const application = await Apprenticeship.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!application) return res.status(404).json({ error: "Application not found." });
    res.json(application);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

// Increments the supervised-job counter; graduates the apprentice once the
// threshold is reached. Actual pay splitting happens via
// walletController.settleApprenticeshipJob — call both from your service
// layer / API gateway in the order that suits your client.
export async function recordSupervisedJob(req: Request, res: Response) {
  try {
    const application = await Apprenticeship.findById(req.params.id);
    if (!application) return res.status(404).json({ error: "Application not found." });
    if (application.status !== "training") {
      return res.status(400).json({ error: "Application is not currently in training." });
    }

    application.completedSupervisedJobs += 1;
    if (application.completedSupervisedJobs >= GRADUATION_JOBS_THRESHOLD) {
      application.status = "graduated";
    }
    await application.save();

    res.json(application);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function listApplicationsForMaster(req: Request, res: Response) {
  const applications = await Apprenticeship.find({ master: req.params.masterId }).sort({ createdAt: -1 });
  res.json(applications);
}

export async function listMasters(req: Request, res: Response) {
  const masters = await Master.find().populate("worker");
  res.json(masters);
}
