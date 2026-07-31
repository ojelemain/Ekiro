import { Request, Response } from "express";
import { Wallet, Transaction } from "../models/Wallet";

const TREASURY_SPLIT = 0.8; // civic tasks: 80% treasury / 20% tasker
const APPRENTICE_SPLIT = 0.6; // apprenticeship jobs: 60% apprentice / 40% master
const MONTHLY_LISTING_FEE_NAIRA = 500;
const LISTING_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

export async function getWallet(req: Request, res: Response) {
  const wallet = await Wallet.findOne({ ekitiId: req.params.ekitiId });
  if (!wallet) return res.status(404).json({ error: "Wallet not found." });
  res.json(wallet);
}

// Civic verification task on Tasker Radar — government-funded, so treasury
// takes the majority share and the IGR gain is the point.
export async function settleCivicTask(req: Request, res: Response) {
  const { ekitiId, grossNaira, referenceId, reason } = req.body;
  const treasuryShare = Math.round(grossNaira * TREASURY_SPLIT);
  const taskerShare = grossNaira - treasuryShare;

  const wallet = await Wallet.findOneAndUpdate(
    { ekitiId },
    { $inc: { balanceNaira: taskerShare, civicScore: 5 } },
    { new: true }
  );
  if (!wallet) return res.status(404).json({ error: "Wallet not found." });

  await Transaction.create({
    wallet: wallet._id,
    type: "civic_task",
    grossNaira,
    walletShareNaira: taskerShare,
    counterpartyShareNaira: treasuryShare,
    referenceId,
    reason: reason || `Civic task ${referenceId} completed`,
  });

  res.json(wallet);
}

// Jobs Marketplace booking — customer-to-worker commerce. Worker keeps 100%;
// EKIRO earns from the flat monthly listing fee instead of a per-job cut.
export async function settleJobBooking(req: Request, res: Response) {
  const { ekitiId, grossNaira, referenceId, reason } = req.body;

  const wallet = await Wallet.findOneAndUpdate(
    { ekitiId },
    { $inc: { balanceNaira: grossNaira, civicScore: 3 } },
    { new: true }
  );
  if (!wallet) return res.status(404).json({ error: "Wallet not found." });

  await Transaction.create({
    wallet: wallet._id,
    type: "job_booking",
    grossNaira,
    walletShareNaira: grossNaira,
    counterpartyShareNaira: 0,
    referenceId,
    reason: reason || `Booking ${referenceId} completed`,
  });

  res.json(wallet);
}

// Teaching Hub supervised job — split 60% apprentice / 40% Master.
// `walletEkitiId` is whichever side (apprentice or Master) this call is
// crediting; call this endpoint twice (once per side) from the Teaching Hub
// service layer, or extend it to accept both IDs at once as your API evolves.
export async function settleApprenticeshipJob(req: Request, res: Response) {
  const { apprenticeEkitiId, masterEkitiId, grossNaira, referenceId } = req.body;
  const apprenticeShare = Math.round(grossNaira * APPRENTICE_SPLIT);
  const masterShare = grossNaira - apprenticeShare;

  const apprenticeWallet = await Wallet.findOneAndUpdate(
    { ekitiId: apprenticeEkitiId },
    { $inc: { balanceNaira: apprenticeShare, civicScore: 2 } },
    { new: true }
  );
  const masterWallet = await Wallet.findOneAndUpdate(
    { ekitiId: masterEkitiId },
    { $inc: { balanceNaira: masterShare } },
    { new: true }
  );

  if (!apprenticeWallet || !masterWallet) {
    return res.status(404).json({ error: "Apprentice or Master wallet not found." });
  }

  await Transaction.create({
    wallet: apprenticeWallet._id,
    type: "apprenticeship",
    grossNaira,
    walletShareNaira: apprenticeShare,
    counterpartyShareNaira: masterShare,
    referenceId,
    reason: `Supervised job completed under apprenticeship ${referenceId}`,
  });
  await Transaction.create({
    wallet: masterWallet._id,
    type: "apprenticeship",
    grossNaira,
    walletShareNaira: masterShare,
    counterpartyShareNaira: apprenticeShare,
    referenceId,
    reason: `Supervision payout for apprenticeship ${referenceId}`,
  });

  res.json({ apprenticeWallet, masterWallet });
}

export async function payListingFee(req: Request, res: Response) {
  const { ekitiId } = req.body;
  const wallet = await Wallet.findOne({ ekitiId });
  if (!wallet) return res.status(404).json({ error: "Wallet not found." });

  const now = Date.now();
  const base = wallet.listingExpiresAt && wallet.listingExpiresAt.getTime() > now ? wallet.listingExpiresAt.getTime() : now;
  wallet.listingExpiresAt = new Date(base + LISTING_PERIOD_MS);
  wallet.isListingActive = true;
  await wallet.save();

  await Transaction.create({
    wallet: wallet._id,
    type: "listing_fee",
    grossNaira: MONTHLY_LISTING_FEE_NAIRA,
    walletShareNaira: 0,
    counterpartyShareNaira: MONTHLY_LISTING_FEE_NAIRA,
    referenceId: String(wallet._id),
    reason: "Monthly worker listing fee",
  });

  res.json(wallet);
}

export async function withdraw(req: Request, res: Response) {
  const { ekitiId, amountNaira } = req.body;
  const wallet = await Wallet.findOne({ ekitiId });
  if (!wallet) return res.status(404).json({ error: "Wallet not found." });
  if (amountNaira <= 0 || amountNaira > wallet.balanceNaira) {
    return res.status(400).json({ error: "Invalid withdrawal amount." });
  }

  wallet.balanceNaira -= amountNaira;
  await wallet.save();

  await Transaction.create({
    wallet: wallet._id,
    type: "withdrawal",
    grossNaira: amountNaira,
    walletShareNaira: -amountNaira,
    counterpartyShareNaira: 0,
    referenceId: String(wallet._id),
    reason: "Withdrawal to bank",
  });

  res.json(wallet);
}

export async function getTransactions(req: Request, res: Response) {
  const wallet = await Wallet.findOne({ ekitiId: req.params.ekitiId });
  if (!wallet) return res.status(404).json({ error: "Wallet not found." });
  const transactions = await Transaction.find({ wallet: wallet._id }).sort({ createdAt: -1 }).limit(100);
  res.json(transactions);
}
