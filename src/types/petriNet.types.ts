import { Types, Document } from "mongoose";

export interface PlaceDocument extends Document {
  _id: Types.ObjectId;
  nom: string;
  type: string;
  tokens: number;
}

export interface TransitionDocument extends Document {
  _id: Types.ObjectId;
  nom: string;
  type: string;
  enabled: boolean;
}

export interface ArcDocument extends Document {
  _id: Types.ObjectId;
  from: string;
  to: string;
  poids: number;
  type: string;
}

export interface PetriNetStateDocument extends Document {
  _id: Types.ObjectId;
  nom: string;
  places: string[];
  transitions: string[];
  arcs: string[];
  etatActuel: Map<string, number>;
  historique: Array<{
    timestamp: Date;
    transition: string;
    etatAvant: Map<string, number>;
    etatApres: Map<string, number>;
  }>;
}

export interface FireTransitionResult {
  success: boolean;
  message?: string;
  newState?: Record<string, number>;
}

export interface NetworkInfo {
  totalPlaces: number;
  totalTransitions: number;
  totalArcs: number;
  placesWithTokens: number;
  enabledTransitions: string[];
}

export interface SynchronizationResult {
  ouvriers: { disponibles: number; occupes: number; absents: number };
  machines: { actives: number; enPanne: number; enMaintenance: number };
  ateliers: { actifs: number; fermes: number; enMaintenance: number };
}