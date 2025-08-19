import { Schema, model, Document } from "mongoose";

export interface ITache extends Document {
    nom: string;
    usage: string; // Type de tâche (correspond aux compétences/usage)
    type: "affectation" | "liberation" | "maintenance" | "production";
    dureeEstimee: number; // en heures
    priorite: "basse" | "normale" | "haute" | "critique";
    prerequis: string[]; // Compétences requises
    ressourcesRequises: {
        ateliers: string[]; // IDs des ateliers requis
        machines: string[]; // IDs des machines requises
        ouvriers: number; // Nombre d'ouvriers requis
    };
    status: "en_attente" | "en_cours" | "terminee" | "annulee";
    dateCreation: Date;
    dateDebut?: Date;
    dateFin?: Date;
}

const TacheSchema = new Schema<ITache>({
    nom: { type: String, required: true },
    usage: { type: String, required: true }, // Ex: "soudure", "assemblage", "maintenance"
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
    prerequis: [{ type: String }], // Compétences requises
    ressourcesRequises: {
        ateliers: [{ type: Schema.Types.ObjectId, ref: "Atelier" }],
        machines: [{ type: Schema.Types.ObjectId, ref: "Machine" }],
        ouvriers: [{ type: Schema.Types.ObjectId, ref: "Ouvrier" }],
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

// Index pour optimiser les requêtes par usage, statut et priorité
TacheSchema.index({ usage: 1, status: 1, priorite: 1 });

export const Tache = model<ITache>("Tache", TacheSchema);