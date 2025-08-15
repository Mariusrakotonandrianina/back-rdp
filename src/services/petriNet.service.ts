import { Place, Transition, Arc, PetriNetState } from "../models/petriNet.model";
import { Ouvrier } from "../models/ouvrier.model";
import { Machine } from "../models/machine.model";
import { Atelier } from "../models/atelier.model";
import { Types } from "mongoose";

interface FireTransitionResult {
  success: boolean;
  message?: string;
  newState?: any;
}

interface NetworkInfo {
  totalPlaces: number;
  totalTransitions: number;
  totalArcs: number;
  placesWithTokens: number;
  enabledTransitions: string[];
}

export class PetriNetService {
  private netId: string;

  constructor(netId: string) {
    this.netId = netId;
  }

  // Réinitialiser complètement le réseau
  async resetNetwork() {
    await Promise.all([
      Place.deleteMany({}),
      Transition.deleteMany({}),
      Arc.deleteMany({}),
      PetriNetState.deleteMany({})
    ]);
  }

  // Initialiser le réseau de Petri pour l'atelier
  async initializeAtelierNetwork() {
    try {
      // Nettoyer l'ancien réseau
      await this.resetNetwork();

      // Créer les places pour les ressources
      const placesData = [
        // Places pour les ouvriers
        { nom: "OuvriersDisponibles", type: "ouvrier", tokens: 0 },
        { nom: "OuvriersOccupes", type: "ouvrier", tokens: 0 },
        { nom: "OuvriersAbsents", type: "ouvrier", tokens: 0 },
        
        // Places pour les machines
        { nom: "MachinesActives", type: "machine", tokens: 0 },
        { nom: "MachinesEnPanne", type: "machine", tokens: 0 },
        { nom: "MachinesEnMaintenance", type: "machine", tokens: 0 },
        
        // Places pour les ateliers
        { nom: "AteliersActifs", type: "atelier", tokens: 0 },
        { nom: "AteliersFermes", type: "atelier", tokens: 0 },
        { nom: "AteliersEnMaintenance", type: "atelier", tokens: 0 },
        
        // Places pour les tâches
        { nom: "TachesEnAttente", type: "tache", tokens: 0 },
        { nom: "TachesEnCours", type: "tache", tokens: 0 },
        { nom: "TachesTerminees", type: "tache", tokens: 0 }
      ];

      const places = await Place.insertMany(placesData);
      const placeMap = new Map<string, string>();
      places.forEach(place => placeMap.set(place.nom, place._id.toString()));

      // Créer les transitions
      const transitionsData = [
        { nom: "AffecterOuvrierTache", type: "affectation", enabled: true },
        { nom: "LibererOuvrier", type: "liberation", enabled: true },
        { nom: "MarquerOuvrierAbsent", type: "affectation", enabled: true },
        { nom: "RetourOuvrierDisponible", type: "liberation", enabled: true },
        { nom: "DemarrerMachine", type: "production", enabled: true },
        { nom: "ArreterMachine", type: "maintenance", enabled: true },
        { nom: "ReparerMachine", type: "maintenance", enabled: true },
        { nom: "CommencerTache", type: "production", enabled: true },
        { nom: "TerminerTache", type: "production", enabled: true }
      ];

      const transitions = await Transition.insertMany(transitionsData);
      const transitionMap = new Map<string, string>();
      transitions.forEach(transition => transitionMap.set(transition.nom, transition._id.toString()));

      // Créer les arcs avec les bons IDs
      const arcsData = [
        // Cycle ouvrier disponible -> occupé
        {
          from: placeMap.get("OuvriersDisponibles")!,
          to: transitionMap.get("AffecterOuvrierTache")!,
          poids: 1,
          type: "place-to-transition"
        },
        {
          from: transitionMap.get("AffecterOuvrierTache")!,
          to: placeMap.get("OuvriersOccupes")!,
          poids: 1,
          type: "transition-to-place"
        },
        
        // Cycle ouvrier occupé -> disponible
        {
          from: placeMap.get("OuvriersOccupes")!,
          to: transitionMap.get("LibererOuvrier")!,
          poids: 1,
          type: "place-to-transition"
        },
        {
          from: transitionMap.get("LibererOuvrier")!,
          to: placeMap.get("OuvriersDisponibles")!,
          poids: 1,
          type: "transition-to-place"
        },
        
        // Cycle ouvrier disponible -> absent
        {
          from: placeMap.get("OuvriersDisponibles")!,
          to: transitionMap.get("MarquerOuvrierAbsent")!,
          poids: 1,
          type: "place-to-transition"
        },
        {
          from: transitionMap.get("MarquerOuvrierAbsent")!,
          to: placeMap.get("OuvriersAbsents")!,
          poids: 1,
          type: "transition-to-place"
        },
        
        // Cycle ouvrier absent -> disponible
        {
          from: placeMap.get("OuvriersAbsents")!,
          to: transitionMap.get("RetourOuvrierDisponible")!,
          poids: 1,
          type: "place-to-transition"
        },
        {
          from: transitionMap.get("RetourOuvrierDisponible")!,
          to: placeMap.get("OuvriersDisponibles")!,
          poids: 1,
          type: "transition-to-place"
        },
        
        // Cycle des tâches
        {
          from: placeMap.get("TachesEnAttente")!,
          to: transitionMap.get("CommencerTache")!,
          poids: 1,
          type: "place-to-transition"
        },
        {
          from: transitionMap.get("CommencerTache")!,
          to: placeMap.get("TachesEnCours")!,
          poids: 1,
          type: "transition-to-place"
        },
        {
          from: placeMap.get("TachesEnCours")!,
          to: transitionMap.get("TerminerTache")!,
          poids: 1,
          type: "place-to-transition"
        },
        {
          from: transitionMap.get("TerminerTache")!,
          to: placeMap.get("TachesTerminees")!,
          poids: 1,
          type: "transition-to-place"
        }
      ];

      const arcs = await Arc.insertMany(arcsData);

      // Créer l'état initial du réseau avec synchronisation
      const initialStateData: Record<string, number> = {};
      places.forEach(place => {
        initialStateData[place._id.toString()] = place.tokens;
      });

      const initialState = new PetriNetState({
        nom: "ReseauAtelierPrincipal",
        places: places.map(p => p._id.toString()),
        transitions: transitions.map(t => t._id.toString()),
        arcs: arcs.map(a => a._id.toString()),
        etatActuel: initialStateData,
        historique: []
      });

      await initialState.save();
      
      // Synchroniser immédiatement avec l'état réel
      await this.synchronizeWithRealState();
      
      return initialState._id;
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
      throw new Error(`Échec de l'initialisation du réseau: ${error}`);
    }
  }

  // Vérifier si une transition est activable
  async isTransitionEnabled(transitionId: string): Promise<boolean> {
    try {
      const transition = await Transition.findById(transitionId);
      if (!transition || !transition.enabled) return false;

      // Récupérer les arcs entrants
      const incomingArcs = await Arc.find({ 
        to: transitionId, 
        type: "place-to-transition" 
      });

      const netState = await PetriNetState.findOne({ nom: "ReseauAtelierPrincipal" });
      if (!netState) return false;

      // Vérifier si toutes les places d'entrée ont suffisamment de jetons
      for (const arc of incomingArcs) {
        const tokens = netState.etatActuel.get(arc.from) || 0;
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

  // Tirer une transition
  async fireTransition(transitionId: string): Promise<FireTransitionResult> {
    try {
      // Vérifier si l'ID est valide
      if (!Types.ObjectId.isValid(transitionId)) {
        return { success: false, message: "ID de transition invalide" };
      }

      const isEnabled = await this.isTransitionEnabled(transitionId);
      if (!isEnabled) {
        return { success: false, message: "Transition non activable" };
      }

      const netState = await PetriNetState.findOne({ nom: "ReseauAtelierPrincipal" });
      if (!netState) {
        return { success: false, message: "État du réseau non trouvé" };
      }

      const etatAvant = new Map(netState.etatActuel);
      
      // Récupérer tous les arcs liés à cette transition
      const incomingArcs = await Arc.find({ 
        to: transitionId, 
        type: "place-to-transition" 
      });
      
      const outgoingArcs = await Arc.find({ 
        from: transitionId, 
        type: "transition-to-place" 
      });

      // Retirer les jetons des places d'entrée
      for (const arc of incomingArcs) {
        const currentTokens = netState.etatActuel.get(arc.from) || 0;
        netState.etatActuel.set(arc.from, currentTokens - arc.poids);
      }

      // Ajouter les jetons aux places de sortie
      for (const arc of outgoingArcs) {
        const currentTokens = netState.etatActuel.get(arc.to) || 0;
        netState.etatActuel.set(arc.to, currentTokens + arc.poids);
      }

      // Enregistrer dans l'historique
      netState.historique.push({
        timestamp: new Date(),
        transition: transitionId,
        etatAvant: Object.fromEntries(etatAvant),
        etatApres: Object.fromEntries(netState.etatActuel)
      });

      // Limiter l'historique aux 50 dernières entrées
      if (netState.historique.length > 50) {
        netState.historique = netState.historique.slice(-50);
      }

      await netState.save();
      
      return { 
        success: true, 
        newState: Object.fromEntries(netState.etatActuel)
      };
    } catch (error) {
      console.error("Erreur lors du tir de transition:", error);
      return { 
        success: false, 
        message: `Erreur lors du tir: ${error instanceof Error ? error.message : "Erreur inconnue"}` 
      };
    }
  }

  // Synchroniser avec l'état réel des ressources
  async synchronizeWithRealState() {
    try {
      const netState = await PetriNetState.findOne({ nom: "ReseauAtelierPrincipal" });
      if (!netState) {
        throw new Error("État du réseau non trouvé");
      }

      // Synchroniser les ouvriers
      const [disponibles, occupes, absents] = await Promise.all([
        Ouvrier.countDocuments({ statut: "disponible" }),
        Ouvrier.countDocuments({ statut: "occupe" }),
        Ouvrier.countDocuments({ statut: "absent" })
      ]);

      // Synchroniser les machines
      const [machinesActives, machinesEnPanne, machinesEnMaintenance] = await Promise.all([
        Machine.countDocuments({ status: "active" }),
        Machine.countDocuments({ status: "panne" }),
        Machine.countDocuments({ status: "maintenance" })
      ]);

      // Synchroniser les ateliers
      const [ateliersActifs, ateliersFermes, ateliersEnMaintenance] = await Promise.all([
        Atelier.countDocuments({ status: "actif" }),
        Atelier.countDocuments({ status: "ferme" }),
        Atelier.countDocuments({ status: "maintenance" })
      ]);

      // Récupérer les places et mettre à jour les tokens
      const places = await Place.find();
      
      for (const place of places) {
        let tokens = 0;
        
        // Ouvriers
        if (place.nom === "OuvriersDisponibles") tokens = disponibles;
        else if (place.nom === "OuvriersOccupes") tokens = occupes;
        else if (place.nom === "OuvriersAbsents") tokens = absents;
        
        // Machines
        else if (place.nom === "MachinesActives") tokens = machinesActives;
        else if (place.nom === "MachinesEnPanne") tokens = machinesEnPanne;
        else if (place.nom === "MachinesEnMaintenance") tokens = machinesEnMaintenance;
        
        // Ateliers
        else if (place.nom === "AteliersActifs") tokens = ateliersActifs;
        else if (place.nom === "AteliersFermes") tokens = ateliersFermes;
        else if (place.nom === "AteliersEnMaintenance") tokens = ateliersEnMaintenance;
        
        // Mettre à jour la place et l'état du réseau
        place.tokens = tokens;
        await place.save();
        netState.etatActuel.set(place._id.toString(), tokens);
      }

      await netState.save();
      
      return {
        ouvriers: { disponibles, occupes, absents },
        machines: { actives: machinesActives, enPanne: machinesEnPanne, enMaintenance: machinesEnMaintenance },
        ateliers: { actifs: ateliersActifs, fermes: ateliersFermes, enMaintenance: ateliersEnMaintenance }
      };
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
      throw new Error(`Échec de la synchronisation: ${error}`);
    }
  }

  // Obtenir l'état actuel du réseau
  async getCurrentState() {
    try {
      const netState = await PetriNetState.findOne({ nom: "ReseauAtelierPrincipal" });
      if (!netState) return null;

      // Calculer les transitions activables
      const transitions = await Transition.find();
      const enabledTransitions = [];
      
      for (const transition of transitions) {
        if (await this.isTransitionEnabled(transition._id.toString())) {
          enabledTransitions.push({
            id: transition._id,
            nom: transition.nom,
            type: transition.type
          });
        }
      }

      // Récupérer les informations des places
      const places = await Place.find();
      const placesInfo = places.map(place => ({
        id: place._id,
        nom: place.nom,
        type: place.type,
        tokens: netState.etatActuel.get(place._id.toString()) || 0
      }));

      return {
        etatActuel: Object.fromEntries(netState.etatActuel),
        places: placesInfo,
        transitionsActivables: enabledTransitions,
        historique: netState.historique.slice(-10), // Dernières 10 transitions
        totalTokens: Array.from(netState.etatActuel.values()).reduce((sum, tokens) => sum + tokens, 0)
      };
    } catch (error) {
      console.error("Erreur récupération état:", error);
      throw new Error(`Échec de la récupération de l'état: ${error}`);
    }
  }

  // Obtenir les informations générales du réseau
  async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      const [totalPlaces, totalTransitions, totalArcs, netState] = await Promise.all([
        Place.countDocuments(),
        Transition.countDocuments(),
        Arc.countDocuments(),
        PetriNetState.findOne({ nom: "ReseauAtelierPrincipal" })
      ]);

      let placesWithTokens = 0;
      const enabledTransitions: string[] = [];

      if (netState) {
        // Compter les places avec des tokens
        for (const [_, tokens] of netState.etatActuel) {
          if (tokens > 0) placesWithTokens++;
        }

        // Récupérer les transitions activables
        const transitions = await Transition.find();
        for (const transition of transitions) {
          if (await this.isTransitionEnabled(transition._id.toString())) {
            enabledTransitions.push(transition.nom);
          }
        }
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
}