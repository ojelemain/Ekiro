import { Request, Response } from "express";
import { SubsidizedBatch, OverchargeReport, StateStoreItem } from "../models/PriceTransparency";

export async function lookupBatch(req: Request, res: Response) {
  const batch = await SubsidizedBatch.findOne({
    batchCode: new RegExp(`^${req.params.code}$`, "i"),
  });
  if (!batch) return res.status(404).json({ error: "Batch code not recognized." });
  res.json(batch);
}

export async function reportOvercharge(req: Request, res: Response) {
  try {
    const { batchCode, reportedPriceNaira, location, reporterNote } = req.body;
    const batch = await SubsidizedBatch.findOne({ batchCode: new RegExp(`^${batchCode}$`, "i") });
    if (!batch) return res.status(404).json({ error: "Batch code not recognized." });

    const report = await OverchargeReport.create({
      batchCode: batch.batchCode,
      itemName: batch.itemName,
      officialPriceNaira: batch.officialPriceNaira,
      reportedPriceNaira,
      location,
      reporterNote,
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

// Aggregates repeated reports per batch — surfaces a diversion pattern
// automatically without needing an inspector to catch anyone in the act.
export async function getDiversionFlags(req: Request, res: Response) {
  const flags = await OverchargeReport.aggregate([
    {
      $group: {
        _id: "$batchCode",
        itemName: { $first: "$itemName" },
        reportCount: { $sum: 1 },
        maxOverchargeNaira: { $max: { $subtract: ["$reportedPriceNaira", "$officialPriceNaira"] } },
      },
    },
    { $project: { batchCode: "$_id", itemName: 1, reportCount: 1, maxOverchargeNaira: 1, _id: 0 } },
    { $sort: { reportCount: -1 } },
  ]);
  res.json(flags);
}

export async function listReports(req: Request, res: Response) {
  const reports = await OverchargeReport.find().sort({ createdAt: -1 });
  res.json(reports);
}

export async function listStoreItems(req: Request, res: Response) {
  const items = await StateStoreItem.find();
  res.json(items);
}

export async function placeStoreOrder(req: Request, res: Response) {
  try {
    const { itemId, quantity } = req.body;
    const item = await StateStoreItem.findById(itemId);
    if (!item) return res.status(404).json({ error: "Item not found." });
    if (quantity <= 0 || quantity > item.availableQuantity) {
      return res.status(400).json({ error: "Invalid quantity." });
    }

    item.availableQuantity -= quantity;
    await item.save();

    res.status(201).json({
      itemId,
      itemName: item.itemName,
      quantity,
      totalNaira: item.priceNaira * quantity,
      item,
    });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}
