import { Schema, model, Document } from "mongoose";

export type StatutOuvrier = "disponible" | "occupe" | "absent";

export interface IOuvrier extends Document {
    nom: string;
    niveau: "Expert" | "Confirmé" | "Débutant";
    statut: StatutOuvrier;
    tacheActuelle?: string | null;
    tacheSuivante?: string | null;
    heuresJour: number;
    heuresMax: number;
    competences: string[];
}

const OuvrierSchema = new Schema<IOuvrier>({
    nom: { type: String, required: true },
    niveau: {
        type: String,
        enum: ["Expert", "Confirmé", "Débutant"],
        required: true,
    },
    statut: {
        type: String,
        enum: ["disponible", "occupe", "absent"],
        required: true,
    },
    tacheActuelle: { type: String, default: null },
    tacheSuivante: { type: String, default: null },
    heuresJour: { type: Number, required: true },
    heuresMax: { type: Number, required: true },
    competences: { type: [String], required: true },
});

export const Ouvrier = model<IOuvrier>("Ouvrier", OuvrierSchema);
