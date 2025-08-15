// src/routes/petriNet.routes.ts - Routes mises à jour avec nouvelles fonctionnalités
import { Router } from "express";
import {
  initializeNetwork,
  getCurrentState,
  fireTransition,
  synchronizeState,
  getNetworkInfo,
  resetNetwork,
  getPlaces,
  getTransitions,
  isTransitionEnabled,
  getSystemSummary
} from "../controllers/petriNet.controller";

const petriNetRoutes = Router();

// Routes principales
petriNetRoutes.post("/initialize", initializeNetwork);
petriNetRoutes.get("/state", getCurrentState);
petriNetRoutes.post("/fire/:transitionId", fireTransition);
petriNetRoutes.post("/synchronize", synchronizeState);

// Routes d'information
petriNetRoutes.get("/info", getNetworkInfo);
petriNetRoutes.get("/places", getPlaces);
petriNetRoutes.get("/transitions", getTransitions);
petriNetRoutes.get("/summary", getSystemSummary);

// Routes de vérification
petriNetRoutes.get("/transition/:transitionId/enabled", isTransitionEnabled);

// Routes de maintenance
petriNetRoutes.post("/reset", resetNetwork);

// Route de santé spécifique au réseau de Petr

export default petriNetRoutes;

// src/types/petriNet.types.ts - Types TypeScript pour le frontend
export interface Place {
  id: string;
  nom: string;
  type: 'ouvrier' | 'machine' | 'atelier' | 'tache' | 'ressource';
  tokens: number;
  capacite?: number;
  resourceId?: string;
}

export interface Transition {
  id: string;
  nom: string;
  type: 'affectation' | 'liberation' | 'maintenance' | 'production';
  enabled?: boolean;
  conditions?: string[];
  duree?: number;
}

export interface Arc {
  id: string;
  from: string;
  to: string;
  poids: number;
  type: 'place-to-transition' | 'transition-to-place';
}

export interface PetriNetHistoryEntry {
  timestamp: Date;
  transition: string;
  etatAvant: Record<string, number>;
  etatApres: Record<string, number>;
}

export interface PetriState {
  message?: string;
  data?: {
    etatActuel: Record<string, number>;
    places: Place[];
    transitionsActivables: Transition[];
    historique: PetriNetHistoryEntry[];
    totalTokens: number;
  };
}

export interface FireTransitionResponse {
  message: string;
  transitionId: string;
  newState?: Record<string, number>;
}

export interface NetworkInfo {
  totalPlaces: number;
  totalTransitions: number;
  totalArcs: number;
  placesWithTokens: number;
  enabledTransitions: string[];
}

export interface SystemSummary {
  network: NetworkInfo;
  tokens: {
    total: number;
    distribution: Record<string, number>;
  };
  realState: {
    ouvriers: { disponibles: number; occupes: number; absents: number };
    machines: { actives: number; enPanne: number; enMaintenance: number };
    ateliers: { actifs: number; fermes: number; enMaintenance: number };
  };
  health: {
    synchronized: boolean;
    lastUpdate: string;
  };
}