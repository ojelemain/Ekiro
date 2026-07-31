import { Schema, model, Document, Types } from "mongoose";

export type NominatorType = "self" | "school" | "community";

export interface TalentProfileDocument extends Document {
  ownerEkitiId?: Types.ObjectId;
  ownerName: string;
  category: string;
  headline: string;
  description: string;
  lgaName: string;
  nominatedBy: NominatorType;
  nominatorName?: string;
  isSelf: boolean;
  createdAt: Date;
}

const TalentProfileSchema = new Schema<TalentProfileDocument>(
  {
    ownerEkitiId: { type: Schema.Types.ObjectId, ref: "EkitiId" },
    ownerName: { type: String, required: true },
    category: { type: String, required: true },
    headline: { type: String, required: true },
    description: { type: String, required: true },
    lgaName: { type: String, required: true },
    nominatedBy: { type: String, enum: ["self", "school", "community"], default: "self" },
    nominatorName: { type: String },
    isSelf: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const TalentProfile = model<TalentProfileDocument>("TalentProfile", TalentProfileSchema);

export interface MentorshipInterestDocument extends Document {
  talent: Types.ObjectId;
  mentorEkitiId?: Types.ObjectId;
  createdAt: Date;
}

const MentorshipInterestSchema = new Schema<MentorshipInterestDocument>(
  {
    talent: { type: Schema.Types.ObjectId, ref: "TalentProfile", required: true },
    mentorEkitiId: { type: Schema.Types.ObjectId, ref: "EkitiId" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const MentorshipInterest = model<MentorshipInterestDocument>(
  "MentorshipInterest",
  MentorshipInterestSchema
);
