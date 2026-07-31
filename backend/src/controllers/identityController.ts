import { Request, Response } from "express";
import { EkitiId } from "../models/EkitiId";
import { Wallet } from "../models/Wallet";

function generateIdNumber(path: "resident" | "indigene", lgaCode?: string): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(1000 + Math.random() * 8999));
  return path === "indigene" ? `EKT-${lgaCode || "ADO"}-${year}-${seq}` : `EKT-RES-${year}-${seq}`;
}

export async function registerIdentity(req: Request, res: Response) {
  try {
    const identity = await EkitiId.create({ ...req.body, status: "draft" });
    res.status(201).json(identity);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function submitForVerification(req: Request, res: Response) {
  try {
    const identity = await EkitiId.findByIdAndUpdate(
      req.params.id,
      { status: "pending" },
      { new: true }
    );
    if (!identity) return res.status(404).json({ error: "Identity not found." });
    res.json(identity);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

// In production this would be triggered by an LGA/residency-office reviewer
// through an admin panel, not called directly by the applicant.
export async function approveVerification(req: Request, res: Response) {
  try {
    const identity = await EkitiId.findById(req.params.id);
    if (!identity) return res.status(404).json({ error: "Identity not found." });

    identity.idNumber = generateIdNumber(identity.verificationPath, identity.lgaCode);
    identity.verifiedByLga =
      identity.verificationPath === "indigene" ? identity.lgaName || "Ekiti State" : "Ekiti State Residency Office";
    identity.status = "verified";
    identity.issuedAt = new Date();
    await identity.save();

    // Every verified identity gets a wallet — this is the gate everything
    // else in the app should check before allowing participation.
    await Wallet.findOneAndUpdate(
      { ekitiId: identity._id },
      { ekitiId: identity._id },
      { upsert: true, new: true }
    );

    res.json(identity);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function linkNin(req: Request, res: Response) {
  try {
    const { nin } = req.body;
    const identity = await EkitiId.findByIdAndUpdate(req.params.id, { nin }, { new: true });
    if (!identity) return res.status(404).json({ error: "Identity not found." });
    res.json(identity);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function getIdentity(req: Request, res: Response) {
  try {
    const identity = await EkitiId.findById(req.params.id);
    if (!identity) return res.status(404).json({ error: "Identity not found." });
    res.json(identity);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}
