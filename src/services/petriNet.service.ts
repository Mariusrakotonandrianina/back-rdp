import { Place, Transition, Arc, PetriNetState } from "../models/petriNet.model";
import { Ouvrier } from "../models/ouvrier.model";
import { Machine } from "../models/machine.model";
import { Atelier } from "../models/atelier.model";

export class PetriNetService {
  private netId: string;

  constructor(netId: string) {
    this.netId = netId;
  }

  // Initialiser le réseau de Petri pour l'atelier
  async initializeAtelierNetwork() {
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

    // Créer les transitions
    const transitionsData = [
      { nom: "AffecterOuvrierTache", type: "affectation", enabled: true },
      { nom: "LibererOuvrier", type: "liberation", enabled: true },
      { nom: "MarquerOuvrierAbsent", type: "affectation", enabled: true },
      { nom: "DemarrerMachine", type: "production", enabled: true },
      { nom: "ArreterMachine", type: "maintenance", enabled: true },
      { nom: "ReparerMachine", type: "maintenance", enabled: true },
      { nom: "CommencerTache", type: "production", enabled: true },
      { nom: "TerminerTache", type: "production", enabled: true }
    ];

    const transitions = await Transition.insertMany(transitionsData);

    // Créer les arcs (connexions entre places et transitions)
    const arcsData = [
      // Affectation ouvrier à tâche
      { from: places[0]._id, to: transitions[0]._id, poids: 1, type: "place-to-transition" },
      { from: transitions[0]._id, to: places[1]._id, poids: 1, type: "transition-to-place" },
      
      // Libération ouvrier
      { from: places[1]._id, to: transitions[1]._id, poids: 1, type: "place-to-transition" },
      { from: transitions[1]._id, to: places[0]._id, poids: 1, type: "transition-to-place" },
      
      // Tâches
      { from: places[9]._id, to: transitions[6]._id, poids: 1, type: "place-to-transition" },
      { from: transitions[6]._id, to: places[10]._id, poids: 1, type: "transition-to-place" },
      { from: places[10]._id, to: transitions[7]._id, poids: 1, type: "place-to-transition" },
      { from: transitions[7]._id, to: places[11]._id, poids: 1, type: "transition-to-place" }
    ];

    await Arc.insertMany(arcsData);

    // Créer l'état initial du réseau
    const initialState = new PetriNetState({
      nom: "ReseauAtelierPrincipal",
      places: places.map(p => p._id),
      transitions: transitions.map(t => t._id),
      arcs: arcsData.map((_, i) => `arc_${i}`),
      etatActuel: new Map(),
      historique: []
    });

    await initialState.save();
    return initialState._id;
  }

  // Vérifier si une transition est activable
  async isTransitionEnabled(transitionId: string): Promise<boolean> {
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
  }

  // Tirer une transition
  async fireTransition(transitionId: string): Promise<boolean> {
    if (!(await this.isTransitionEnabled(transitionId))) {
      return false;
    }

    const netState = await PetriNetState.findOne({ nom: "ReseauAtelierPrincipal" });
    if (!netState) return false;

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
      etatAvant: etatAvant,
      etatApres: new Map(netState.etatActuel)
    });

    await netState.save();
    return true;
  }

  // Synchroniser avec l'état réel des ressources
  async synchronizeWithRealState() {
    const netState = await PetriNetState.findOne({ nom: "ReseauAtelierPrincipal" });
    if (!netState) return;

    // Synchroniser les ouvriers
    const [disponibles, occupes, absents] = await Promise.all([
      Ouvrier.countDocuments({ statut: "disponible" }),
      Ouvrier.countDocuments({ statut: "occupe" }),
      Ouvrier.countDocuments({ statut: "absent" })
    ]);

    // Mettre à jour les places correspondantes
    const places = await Place.find({ type: "ouvrier" });
    
    for (const place of places) {
      let tokens = 0;
      if (place.nom === "OuvriersDisponibles") tokens = disponibles;
      else if (place.nom === "OuvriersOccupes") tokens = occupes;
      else if (place.nom === "OuvriersAbsents") tokens = absents;
      
      netState.etatActuel.set(place._id.toString(), tokens);
    }

    // Synchroniser les machines
    const [machinesActives, machinesEnPanne, machinesEnMaintenance] = await Promise.all([
      Machine.countDocuments({ status: "active" }),
      Machine.countDocuments({ status: "panne" }),
      Machine.countDocuments({ status: "maintenance" })
    ]);

    const machinesPlaces = await Place.find({ type: "machine" });
    
    for (const place of machinesPlaces) {
      let tokens = 0;
      if (place.nom === "MachinesActives") tokens = machinesActives;
      else if (place.nom === "MachinesEnPanne") tokens = machinesEnPanne;
      else if (place.nom === "MachinesEnMaintenance") tokens = machinesEnMaintenance;
      
      netState.etatActuel.set(place._id.toString(), tokens);
    }

    await netState.save();
  }

  // Obtenir l'état actuel du réseau
  async getCurrentState() {
    const netState = await PetriNetState.findOne({ nom: "ReseauAtelierPrincipal" })
      .populate('places')
      .populate('transitions');
    
    if (!netState) return null;

    // Calculer les transitions activables
    const enabledTransitions = [];
    for (const transitionId of netState.transitions) {
      if (await this.isTransitionEnabled(transitionId)) {
        enabledTransitions.push(transitionId);
      }
    }

    return {
      etatActuel: Object.fromEntries(netState.etatActuel),
      transitionsActivables: enabledTransitions,
      historique: netState.historique.slice(-10) // Dernières 10 transitions
    };
  }
}