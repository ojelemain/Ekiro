import { Schema, model, Document } from "mongoose";

export interface SubsidizedBatchDocument extends Document {
  batchCode: string;
  itemName: string;
  officialPriceNaira: number;
  unit: string;
  assignedLocation: string;
  agentName: string;
  quantityReleased: number;
}

const SubsidizedBatchSchema = new Schema<SubsidizedBatchDocument>({
  batchCode: { type: String, required: true, unique: true },
  itemName: { type: String, required: true },
  officialPriceNaira: { type: Number, required: true },
  unit: { type: String, required: true },
  assignedLocation: { type: String, required: true },
  agentName: { type: String, required: true },
  quantityReleased: { type: Number, required: true },
});

export const SubsidizedBatch = model<SubsidizedBatchDocument>("SubsidizedBatch", SubsidizedBatchSchema);

export interface OverchargeReportDocument extends Document {
  batchCode: string;
  itemName: string;
  officialPriceNaira: number;
  reportedPriceNaira: number;
  location: string;
  reporterNote: string;
  createdAt: Date;
}

const OverchargeReportSchema = new Schema<OverchargeReportDocument>(
  {
    batchCode: { type: String, required: true },
    itemName: { type: String, required: true },
    officialPriceNaira: { type: Number, required: true },
    reportedPriceNaira: { type: Number, required: true },
    location: { type: String, required: true },
    reporterNote: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const OverchargeReport = model<OverchargeReportDocument>("OverchargeReport", OverchargeReportSchema);

export interface StateStoreItemDocument extends Document {
  itemName: string;
  priceNaira: number;
  unit: string;
  availableQuantity: number;
  category: string;
}

const StateStoreItemSchema = new Schema<StateStoreItemDocument>({
  itemName: { type: String, required: true },
  priceNaira: { type: Number, required: true },
  unit: { type: String, required: true },
  availableQuantity: { type: Number, required: true },
  category: { type: String, required: true },
});

export const StateStoreItem = model<StateStoreItemDocument>("StateStoreItem", StateStoreItemSchema);
