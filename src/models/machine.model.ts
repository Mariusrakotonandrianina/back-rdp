import { Schema, model, Document } from "mongoose";

export interface IMachine extends Document {
  nom: string;
  type: string;
  capacite: number; // en heures
  status: "active" | "panne" | "maintenance";
  utilisation: number; // en heures et compté à partir de l'activation
  usage: string;
  atelierId?: string;
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
  usage: { type: String, required: true }, // Ex: "soudure", "assemblage", "peinture"
  atelierId: { type: Schema.Types.ObjectId, ref: "Atelier" },
});

MachineSchema.index({ usage: 1, status: 1 });

export const Machine = model<IMachine>("Machine", MachineSchema);