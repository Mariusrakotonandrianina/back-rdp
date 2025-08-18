import { Place, Transition, Arc, PetriNetState } from "../models/petriNet.model";
import { PlaceDocument, TransitionDocument, NetworkInfo, PetriNetStateDocument } from "../types/petriNet.types";
import { PetriNetTransitionManager } from "./petriNet.transitions";

export class PetriNetStateManager {
  private transitionManager: PetriNetTransitionManager;

  constructor() {
    this.transitionManager = new PetriNetTransitionManager();
  }

  async getCurrentState() {
    try {
      const netState = await PetriNetState.findOne({ nom: "ReseauAtelierPrincipal" }) as PetriNetStateDocument | null;
      if (!netState) return null;

      const [places, enabledTransitions] = await Promise.all([
        this.getPlacesInfo(netState),
        this.getEnabledTransitions()
      ]);

      return {
        etatActuel: Object.fromEntries(netState.etatActuel),
        places,
        transitionsActivables: enabledTransitions,
        historique: netState.historique.slice(-10),
        totalTokens: Array.from(netState.etatActuel.values()).reduce((sum, tokens) => sum + tokens, 0)
      };
    } catch (error) {
      console.error("Erreur récupération état:", error);
      throw new Error(`Échec de la récupération de l'état: ${error}`);
    }
  }

  async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      const [totalPlaces, totalTransitions, totalArcs, netState] = await Promise.all([
        Place.countDocuments(),
        Transition.countDocuments(),
        Arc.countDocuments(),
        PetriNetState.findOne({ nom: "ReseauAtelierPrincipal" })
      ]) as [number, number, number, PetriNetStateDocument | null];

      let placesWithTokens = 0;
      const enabledTransitions: string[] = [];

      if (netState) {
        placesWithTokens = this.countPlacesWithTokens(netState);
        const enabledTransitionsData = await this.getEnabledTransitions();
        enabledTransitions.push(...enabledTransitionsData.map(t => t.nom));
      }

      return {
        totalPlaces,
        totalTransitions,
        totalArcs,
        placesWithTokens,
        enabledTransitions
      };
    } catch (error) {
      console.error("Erreur info réseau:", error);
      throw new Error(`Échec de la récupération des informations: ${error}`);
    }
  }

  private async getPlacesInfo(netState: PetriNetStateDocument) {
    const places = await Place.find() as PlaceDocument[];
    return places.map(place => ({
      id: place._id.toString(),
      nom: place.nom,
      type: place.type,
      tokens: netState.etatActuel.get(place._id.toString()) || 0
    }));
  }

  private async getEnabledTransitions() {
    const transitions = await Transition.find() as TransitionDocument[];
    const enabledTransitions = [];
    
    for (const transition of transitions) {
      const transitionId = transition._id.toString();
      if (await this.transitionManager.isTransitionEnabled(transitionId)) {
        enabledTransitions.push({
          id: transitionId,
          nom: transition.nom,
          type: transition.type
        });
      }
    }

    return enabledTransitions;
  }

  private countPlacesWithTokens(netState: PetriNetStateDocument): number {
    let count = 0;
    for (const [placeId, tokens] of netState.etatActuel) {
      if (tokens > 0) count++;
    }
    return count;
  }
}
