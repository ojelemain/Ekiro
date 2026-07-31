import { Schema, model, Document, Types } from "mongoose";

export type OpportunityKind = "job" | "apprenticeship" | "civic_task" | "scholarship" | "grant" | "volunteer";

export interface OpportunityDocument extends Document {
  kind: OpportunityKind;
  title: string;
  description: string;
  requiredSkills: string[];
  minCivicScore: number;
  requiresIndigene: boolean;
  rewardDescription: string;
  deadline: string;
  location: string;
}

const OpportunitySchema = new Schema<OpportunityDocument>({
  kind: {
    type: String,
    enum: ["job", "apprenticeship", "civic_task", "scholarship", "grant", "volunteer"],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [{ type: String }],
  minCivicScore: { type: Number, default: 0 },
  requiresIndigene: { type: Boolean, default: false },
  rewardDescription: { type: String, required: true },
  deadline: { type: String, required: true },
  location: { type: String, required: true },
});

export const Opportunity = model<OpportunityDocument>("Opportunity", OpportunitySchema);

export interface InterestExpressionDocument extends Document {
  opportunity: Types.ObjectId;
  citizenEkitiId?: Types.ObjectId;
  createdAt: Date;
}

const InterestExpressionSchema = new Schema<InterestExpressionDocument>(
  {
    opportunity: { type: Schema.Types.ObjectId, ref: "Opportunity", required: true },
    citizenEkitiId: { type: Schema.Types.ObjectId, ref: "EkitiId" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const InterestExpression = model<InterestExpressionDocument>(
  "InterestExpression",
  InterestExpressionSchema
);
