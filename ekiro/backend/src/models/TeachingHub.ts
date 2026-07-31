import { Schema, model, Document, Types } from "mongoose";

export interface MasterDocument extends Document {
  worker: Types.ObjectId;
  apprenticeSlots: number;
  activeApprentices: number;
  qualifiedByReputation: boolean;
  createdAt: Date;
}

const MasterSchema = new Schema<MasterDocument>(
  {
    worker: { type: Schema.Types.ObjectId, ref: "Worker", required: true },
    apprenticeSlots: { type: Number, required: true },
    activeApprentices: { type: Number, default: 0 },
    qualifiedByReputation: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Master = model<MasterDocument>("Master", MasterSchema);

export type ApplicationStatus = "pending" | "training" | "graduated" | "rejected";

export interface ApprenticeshipDocument extends Document {
  applicantEkitiId: Types.ObjectId;
  applicantName: string;
  master: Types.ObjectId;
  category: string;
  status: ApplicationStatus;
  completedSupervisedJobs: number;
  createdAt: Date;
  updatedAt: Date;
}

const ApprenticeshipSchema = new Schema<ApprenticeshipDocument>(
  {
    applicantEkitiId: { type: Schema.Types.ObjectId, ref: "EkitiId", required: true },
    applicantName: { type: String, required: true },
    master: { type: Schema.Types.ObjectId, ref: "Master", required: true },
    category: { type: String, required: true },
    status: { type: String, enum: ["pending", "training", "graduated", "rejected"], default: "pending" },
    completedSupervisedJobs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Apprenticeship = model<ApprenticeshipDocument>("Apprenticeship", ApprenticeshipSchema);
