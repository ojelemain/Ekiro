import { Schema, model, Document } from "mongoose";

export type VerificationPath = "resident" | "indigene";
export type ResidencyType = "resident" | "elsewhere" | "diaspora";
export type VerificationStatus = "draft" | "pending" | "verified" | "rejected";

export interface EkitiIdDocument extends Document {
  fullName: string;
  dob: string;
  phone: string;
  verificationPath: VerificationPath;
  // Indigene-path fields
  lgaCode?: string;
  lgaName?: string;
  proofType?: string;
  residency?: ResidencyType;
  // Resident-path fields
  currentAddress?: string;
  residentProofType?: string;
  nin?: string;
  // Issuance
  status: VerificationStatus;
  idNumber?: string;
  verifiedByLga?: string;
  issuedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EkitiIdSchema = new Schema<EkitiIdDocument>(
  {
    fullName: { type: String, required: true },
    dob: { type: String, required: true },
    phone: { type: String, required: true },
    verificationPath: { type: String, enum: ["resident", "indigene"], required: true },

    lgaCode: { type: String },
    lgaName: { type: String },
    proofType: { type: String },
    residency: { type: String, enum: ["resident", "elsewhere", "diaspora"] },

    currentAddress: { type: String },
    residentProofType: { type: String },
    nin: { type: String },

    status: { type: String, enum: ["draft", "pending", "verified", "rejected"], default: "draft" },
    idNumber: { type: String, unique: true, sparse: true },
    verifiedByLga: { type: String },
    issuedAt: { type: Date },
  },
  { timestamps: true }
);

export const EkitiId = model<EkitiIdDocument>("EkitiId", EkitiIdSchema);
