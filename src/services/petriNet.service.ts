import { PetriNetUtils } from "../utils/petriNet.utils";
import { PetriNetInitializer } from "./petriNet.initializer";
import { PetriNetTransitionManager } from "./petriNet.transitions";
import { PetriNetSynchronizer } from "./petriNet.synchronizer";
import { PetriNetStateManager } from "./petriNet.state";
import { FireTransitionResult, NetworkInfo, SynchronizationResult, PlaceDocument, TransitionDocument } from "../types/petriNet.types";
import { Place, Transition } from "../models/petriNet.model";

export class PetriNetService {
  private netId: string;
  private transitionManager: PetriNetTransitionManager;
  private synchronizer: PetriNetSynchronizer;
  private stateManager: PetriNetStateManager;

  constructor(netId?: string) {
    this.netId = PetriNetUtils.validateNetId(netId);
    this.transitionManager = new PetriNetTransitionManager();
    this.synchronizer = new PetriNetSynchronizer();
    this.stateManager = new PetriNetStateManager();
  }

  // Méthodes d'initialisation
  async resetNetwork(): Promise<void> {
    return PetriNetInitializer.resetNetwork();
  }

  async initializeAtelierNetwork(): Promise<string> {
    try {
      await PetriNetInitializer.resetNetwork();

      const placeMap = await PetriNetInitializer.createPlaces();
      const transitionMap = await PetriNetInitializer.createTransitions();
      const arcs = await PetriNetInitializer.createArcs(placeMap, transitionMap);

      // Récupérer les documents créés avec le bon typage
      const [places, transitions] = await Promise.all([
        Place.find() as Promise<PlaceDocument[]>,
        Transition.find() as Promise<TransitionDocument[]>
      ]);

      const stateId = await PetriNetInitializer.createInitialState(places, transitions, arcs);
      await this.synchronizer.synchronizeWithRealState();
      
      return stateId;
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
      throw new Error(`Échec de l'initialisation du réseau: ${error}`);
    }
  }

  // Méthodes de gestion des transitions
  async isTransitionEnabled(transitionId: string): Promise<boolean> {
    return this.transitionManager.isTransitionEnabled(transitionId);
  }

  async fireTransition(transitionId: string): Promise<FireTransitionResult> {
    return this.transitionManager.fireTransition(transitionId);
  }

  // Méthodes de synchronisation
  async synchronizeWithRealState(): Promise<SynchronizationResult> {
    return this.synchronizer.synchronizeWithRealState();
  }

  // Méthodes d'état
  async getCurrentState() {
    return this.stateManager.getCurrentState();
  }

  async getNetworkInfo(): Promise<NetworkInfo> {
    return this.stateManager.getNetworkInfo();
  }

  // Getter pour l'ID du réseau
  get networkId(): string {
    return this.netId;
  }
}