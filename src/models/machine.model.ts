import { Schema, model, Document } from "mongoose";

export interface IMachine extends Document {
  nom: string;
  type: string;
  capacite: number;
  status: "active" | "panne" | "maintenance";
  utilisation: number;
  usage: string;
}

const MachineSchema = new Schema<IMachine>({
  nom: { type: String, required: true },
  type: { type: String, required: true },
  capacite: { type: Number, required: true },
  status: {
    type: String,
    enum: ["active", "panne", "maintenance"],
    required: true,
  },
  utilisation: { type: Number, required: true },
  usage: { type: String, required: true },
});

export const Machine = model<IMachine>("Machine", MachineSchema);
