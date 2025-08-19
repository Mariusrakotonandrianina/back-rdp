import { Schema, model, Document } from "mongoose";

export interface IAtelier extends Document {
  nom: string;
  localisation: string;
  superficie: number;
  capaciteEmployes: number;
  ouvrierActuelle: number;
  status: "actif" | "ferme" | "maintenance";
  usage: string;
  machinesAssociees?: string[];
}

const AtelierSchema = new Schema<IAtelier>({
  nom: { type: String, required: true },
  localisation: { type: String, required: true },
  superficie: { type: Number, required: true },
  capaciteEmployes: { type: Number, required: true },
  ouvrierActuelle: { type: Number, required: true, default: 0 },
  status: {
    type: String,
    enum: ["actif", "ferme", "maintenance"],
    required: true,
  },
  usage: { type: String, required: true },
  machinesAssociees: [{ type: Schema.Types.ObjectId, ref: "Machine" }],
});

AtelierSchema.index({ usage: 1, status: 1 });

export const Atelier = model<IAtelier>("Atelier", AtelierSchema);