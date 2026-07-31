import { Schema, model, Document, Types } from "mongoose";

export type ContributionType =
  | "mentorship"
  | "education_sponsorship"
  | "sme_investment"
  | "infrastructure_funding"
  | "healthcare_support"
  | "school_adoption"
  | "equipment_contribution"
  | "innovation_challenge";

export interface FundableProjectDocument extends Document {
  type: ContributionType;
  title: string;
  description: string;
  location: string;
  targetNaira: number | null;
  raisedNaira: number;
}

const FundableProjectSchema = new Schema<FundableProjectDocument>({
  type: {
    type: String,
    enum: [
      "mentorship",
      "education_sponsorship",
      "sme_investment",
      "infrastructure_funding",
      "healthcare_support",
      "school_adoption",
      "equipment_contribution",
      "innovation_challenge",
    ],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  targetNaira: { type: Number, default: null },
  raisedNaira: { type: Number, default: 0 },
});

export const FundableProject = model<FundableProjectDocument>("FundableProject", FundableProjectSchema);

export interface ContributionDocument extends Document {
  type: ContributionType;
  targetId: Types.ObjectId;
  targetTitle: string;
  amountNaira: number | null;
  diasporaEkitiId?: Types.ObjectId;
  diasporaName: string;
  impactNote: string;
  createdAt: Date;
}

const ContributionSchema = new Schema<ContributionDocument>(
  {
    type: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetTitle: { type: String, required: true },
    amountNaira: { type: Number, default: null },
    diasporaEkitiId: { type: Schema.Types.ObjectId, ref: "EkitiId" },
    diasporaName: { type: String, required: true },
    impactNote: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Contribution = model<ContributionDocument>("Contribution", ContributionSchema);
