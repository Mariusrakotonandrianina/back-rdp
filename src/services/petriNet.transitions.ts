import { Transition, Arc, PetriNetState } from "../models/petriNet.model";
import { TransitionDocument, ArcDocument, PetriNetStateDocument, FireTransitionResult } from "../types/petriNet.types";
import { PetriNetUtils } from "../utils/petriNet.utils";

export class PetriNetTransitionManager {
  async isTransitionEnabled(transitionId: string): Promise<boolean> {
    try {
      if (!PetriNetUtils.isValidObjectId(transitionId)) {
        return false;
      }

      const transition = await Transition.findById(transitionId) as TransitionDocument | null;
      if (!transition || !transition.enabled) return false;

      const incomingArcs = await Arc.find({ 
        to: transitionId, 
        type: "place-to-transition" 
      }) as ArcDocument[];

      const netState = await PetriNetState.findOne({ nom: "ReseauAtelierPrincipal" }) as PetriNetStateDocument | null;
      if (!netState) return false;

      for (const arc of incomingArcs) {
        if (!arc.from || !PetriNetUtils.isValidObjectId(arc.from)) return false;
        const placeId = arc.from;
        const tokens = netState.etatActuel.get(placeId) || 0;
        if (tokens < arc.poids) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Erreur vérification transition:", error);
      return false;
    }
  }

  async fireTransition(transitionId: string): Promise<FireTransitionResult> {
    try {
      if (!PetriNetUtils.isValidObjectId(transitionId)) {
        return { success: false, message: "ID de transition invalide" };
      }

      const isEnabled = await this.isTransitionEnabled(transitionId);
      if (!isEnabled) {
        return { success: false, message: "Transition non activable" };
      }

      const netState = await PetriNetState.findOne({ nom: "ReseauAtelierPrincipal" }) as PetriNetStateDocument | null;
      if (!netState) {
        return { success: false, message: "État du réseau non trouvé" };
      }

      const etatAvant = new Map(netState.etatActuel);
      
      const [incomingArcs, outgoingArcs] = await Promise.all([
        Arc.find({ to: transitionId, type: "place-to-transition" }) as Promise<ArcDocument[]>,
        Arc.find({ from: transitionId, type: "transition-to-place" }) as Promise<ArcDocument[]>
      ]);

      // Retirer les jetons des places d'entrée
      this.processIncomingArcs(netState, incomingArcs);

      // Ajouter les jetons aux places de sortie
      this.processOutgoingArcs(netState, outgoingArcs);

      // Enregistrer dans l'historique
      this.addToHistory(netState, transitionId, etatAvant);

      await netState.save();
      
      return { 
        success: true, 
        newState: PetriNetUtils.convertMapToObject(netState.etatActuel)
      };
    } catch (error) {
      console.error("Erreur lors du tir de transition:", error);
      return { 
        success: false, 
        message: `Erreur lors du tir: ${error instanceof Error ? error.message : "Erreur inconnue"}` 
      };
    }
  }

  private processIncomingArcs(netState: PetriNetStateDocument, incomingArcs: ArcDocument[]): void {
    for (const arc of incomingArcs) {
      if (!arc.from || !PetriNetUtils.isValidObjectId(arc.from)) continue;
      const placeId = arc.from;
      const currentTokens = netState.etatActuel.get(placeId) || 0;
      netState.etatActuel.set(placeId, currentTokens - arc.poids);
    }
  }

  private processOutgoingArcs(netState: PetriNetStateDocument, outgoingArcs: ArcDocument[]): void {
    for (const arc of outgoingArcs) {
      if (!arc.to || !PetriNetUtils.isValidObjectId(arc.to)) continue;
      const placeId = arc.to;
      const currentTokens = netState.etatActuel.get(placeId) || 0;
      netState.etatActuel.set(placeId, currentTokens + arc.poids);
    }
  }

  private addToHistory(
    netState: PetriNetStateDocument, 
    transitionId: string, 
    etatAvant: Map<string, number>
  ): void {
    netState.historique.push({
      timestamp: new Date(),
      transition: transitionId,
      etatAvant,
      etatApres: new Map(netState.etatActuel)
    });

    netState.historique = PetriNetUtils.limitHistorySize(netState.historique);
  }
}