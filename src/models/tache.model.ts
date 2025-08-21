import { Schema, model, Document } from "mongoose";

export interface ITache extends Document {
  nom: string;
  usage: string;
  type: "affectation" | "liberation" | "maintenance" | "production";
  dureeEstimee: number;
  priorite: "basse" | "normale" | "haute" | "critique";
  prerequis: string[];
  ressourcesRequises: {
    ateliers: string[];
    machines: string[];
    ouvriers: number;
  };
  status: "en_attente" | "en_cours" | "terminee" | "annulee";
  dateCreation: Date;
  dateDebut?: Date;
  dateFin?: Date;
}

const TacheSchema = new Schema<ITache>({
  nom: { type: String, required: true },
  usage: { type: String, required: true },
  type: {
    type: String,
    enum: ["affectation", "liberation", "maintenance", "production"],
    required: true,
  },
  dureeEstimee: { type: Number, required: true },
  priorite: {
    type: String,
    enum: ["basse", "normale", "haute", "critique"],
    default: "normale",
  },
  prerequis: [{ type: String }],
  ressourcesRequises: {
    ateliers: [{ type: Schema.Types.ObjectId, ref: "Atelier" }],
    machines: [{ type: Schema.Types.ObjectId, ref: "Machine" }],
    ouvriers: [{ type: Number, required: true, default: 1 }],
  },
  status: {
    type: String,
    enum: ["en_attente", "en_cours", "terminee", "annulee"],
    default: "en_attente",
  },
  dateCreation: { type: Date, default: Date.now },
  dateDebut: { type: Date },
  dateFin: { type: Date },
});

TacheSchema.index({ usage: 1, status: 1, priorite: 1 });

export const Tache = model<ITache>("Tache", TacheSchema);
