import { Schema, model, Document } from "mongoose";

export interface IPlace extends Document {
  nom: string;
  type: "machine" | "ouvrier" | "atelier" | "tache" | "ressource";
  tokens: number;
  capacite?: number;
  resourceId?: string;
  usage?: string; // Ajout pour la cohérence des usages
}

export interface ITransition extends Document {
  nom: string;
  type: "affectation" | "liberation" | "maintenance" | "production";
  enabled: boolean;
  conditions?: string[];
  duree?: number;
  usageRequis?: string; // Usage requis pour cette transition
  tacheId?: string; // Référence à la tâche correspondante
}

export interface IArc extends Document {
  from: string;
  to: string;
  poids: number;
  type: "place-to-transition" | "transition-to-place";
}

export interface IPetriNetState extends Document {
  nom: string;
  places: string[];
  transitions: string[];
  arcs: string[];
  etatActuel: Map<string, number>;
  historique: {
    timestamp: Date;
    transition: string;
    etatAvant: Map<string, number>;
    etatApres: Map<string, number>;
    tacheId?: string;
  }[];
}

const PlaceSchema = new Schema<IPlace>({
  nom: { type: String, required: true },
  type: {
    type: String,
    enum: ["machine", "ouvrier", "atelier", "tache", "ressource"],
    required: true,
  },
  tokens: { type: Number, default: 0 },
  capacite: { type: Number },
  resourceId: { type: String },
  usage: { type: String }, // Ex: "soudure", "assemblage"
});

const TransitionSchema = new Schema<ITransition>({
  nom: { type: String, required: true },
  type: {
    type: String,
    enum: ["affectation", "liberation", "maintenance", "production"],
    required: true,
  },
  enabled: { type: Boolean, default: true },
  conditions: { type: [String], default: [] },
  duree: { type: Number, default: 0 },
  usageRequis: { type: String }, // Usage nécessaire pour déclencher la transition
  tacheId: { type: Schema.Types.ObjectId, ref: "Tache" },
});

const ArcSchema = new Schema<IArc>({
  from: { type: String, required: true },
  to: { type: String, required: true },
  poids: { type: Number, default: 1 },
  type: {
    type: String,
    enum: ["place-to-transition", "transition-to-place"],
    required: true,
  },
});

const PetriNetStateSchema = new Schema<IPetriNetState>({
  nom: { type: String, required: true },
  places: [{ type: String }],
  transitions: [{ type: String }],
  arcs: [{ type: String }],
  etatActuel: { type: Map, of: Number, default: new Map() },
  historique: [
    {
      timestamp: { type: Date, default: Date.now },
      transition: String,
      etatAvant: { type: Map, of: Number },
      etatApres: { type: Map, of: Number },
      tacheId: { type: Schema.Types.ObjectId, ref: "Tache" },
    },
  ],
});

export const Place = model<IPlace>("Place", PlaceSchema);
export const Transition = model<ITransition>("Transition", TransitionSchema);
export const Arc = model<IArc>("Arc", ArcSchema);
export const PetriNetState = model<IPetriNetState>(
  "PetriNetState",
  PetriNetStateSchema
);