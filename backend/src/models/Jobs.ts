import { Schema, model, Document, Types } from "mongoose";

export type JobCategory =
  | "plumbing"
  | "electrical"
  | "tailoring"
  | "catering"
  | "mechanic"
  | "tutoring"
  | "tax_helper";

export interface WorkerDocument extends Document {
  ekitiId?: Types.ObjectId;
  name: string;
  category: JobCategory;
  bio: string;
  rateNaira: number;
  rateUnit: "per job" | "per hour";
  rating: number;
  completedJobs: number;
  createdAt: Date;
  updatedAt: Date;
}

const WorkerSchema = new Schema<WorkerDocument>(
  {
    ekitiId: { type: Schema.Types.ObjectId, ref: "EkitiId" },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["plumbing", "electrical", "tailoring", "catering", "mechanic", "tutoring", "tax_helper"],
      required: true,
    },
    bio: { type: String, required: true },
    rateNaira: { type: Number, required: true },
    rateUnit: { type: String, enum: ["per job", "per hour"], required: true },
    rating: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Worker = model<WorkerDocument>("Worker", WorkerSchema);

export type BookingStatus = "requested" | "accepted" | "completed";

export interface BookingDocument extends Document {
  worker: Types.ObjectId;
  customerEkitiId?: Types.ObjectId;
  note: string;
  agreedNaira: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<BookingDocument>(
  {
    worker: { type: Schema.Types.ObjectId, ref: "Worker", required: true },
    customerEkitiId: { type: Schema.Types.ObjectId, ref: "EkitiId" },
    note: { type: String, default: "" },
    agreedNaira: { type: Number, required: true },
    status: { type: String, enum: ["requested", "accepted", "completed"], default: "requested" },
  },
  { timestamps: true }
);

export const Booking = model<BookingDocument>("Booking", BookingSchema);
