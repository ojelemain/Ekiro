import { Schema, model, Document, Types } from "mongoose";

export interface WalletDocument extends Document {
  ekitiId: Types.ObjectId;
  balanceNaira: number;
  civicScore: number;
  isListingActive: boolean;
  listingExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<WalletDocument>(
  {
    ekitiId: { type: Schema.Types.ObjectId, ref: "EkitiId", required: true, unique: true },
    balanceNaira: { type: Number, default: 0 },
    civicScore: { type: Number, default: 500 },
    isListingActive: { type: Boolean, default: false },
    listingExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export const Wallet = model<WalletDocument>("Wallet", WalletSchema);

// A unified transaction log covers every settlement type the frontend
// contexts currently model separately (civic task 80/20, job 100%,
// apprenticeship 60/40). `type` discriminates which split rule applied.
export type TransactionType = "civic_task" | "job_booking" | "apprenticeship" | "listing_fee" | "withdrawal";

export interface TransactionDocument extends Document {
  wallet: Types.ObjectId;
  type: TransactionType;
  grossNaira: number;
  walletShareNaira: number;
  counterpartyShareNaira: number;
  referenceId: string;
  reason: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    wallet: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
    type: {
      type: String,
      enum: ["civic_task", "job_booking", "apprenticeship", "listing_fee", "withdrawal"],
      required: true,
    },
    grossNaira: { type: Number, required: true },
    walletShareNaira: { type: Number, required: true },
    counterpartyShareNaira: { type: Number, default: 0 },
    referenceId: { type: String, required: true },
    reason: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Transaction = model<TransactionDocument>("Transaction", TransactionSchema);
