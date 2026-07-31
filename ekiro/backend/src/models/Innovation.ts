import { Schema, model, Document, Types } from "mongoose";

export interface InnovationChallengeDocument extends Document {
  title: string;
  description: string;
  postedBy: string;
  prizeDescription: string;
  deadline: string;
  status: "open" | "closed";
}

const InnovationChallengeSchema = new Schema<InnovationChallengeDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  postedBy: { type: String, required: true },
  prizeDescription: { type: String, required: true },
  deadline: { type: String, required: true },
  status: { type: String, enum: ["open", "closed"], default: "open" },
});

export const InnovationChallenge = model<InnovationChallengeDocument>(
  "InnovationChallenge",
  InnovationChallengeSchema
);

export interface SubmissionDocument extends Document {
  challenge: Types.ObjectId;
  submitterEkitiId?: Types.ObjectId;
  submitterName: string;
  title: string;
  description: string;
  link?: string;
  endorsements: number;
  isWinner: boolean;
  createdAt: Date;
}

const SubmissionSchema = new Schema<SubmissionDocument>(
  {
    challenge: { type: Schema.Types.ObjectId, ref: "InnovationChallenge", required: true },
    submitterEkitiId: { type: Schema.Types.ObjectId, ref: "EkitiId" },
    submitterName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String },
    endorsements: { type: Number, default: 0 },
    isWinner: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Submission = model<SubmissionDocument>("Submission", SubmissionSchema);
