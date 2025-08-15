import { Schema, model, Document } from "mongoose";

export interface IAtelier extends Document {
  nom: string;
  localisation: string;
  superficie: number; // en m²
  capaciteEmployes: number;
  status: "actif" | "ferme" | "maintenance";
}

const AtelierSchema = new Schema<IAtelier>({
  nom: { type: String, required: true },
  localisation: { type: String, required: true },
  superficie: { type: Number, required: true },
  capaciteEmployes: { type: Number, required: true },
  status: {
    type: String,
    enum: ["actif", "ferme", "maintenance"],
    required: true,
  },
});

export const Atelier = model<IAtelier>("Atelier", AtelierSchema);
