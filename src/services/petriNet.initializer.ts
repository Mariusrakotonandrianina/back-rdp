import { Place, Transition, Arc, PetriNetState } from "../models/petriNet.model";
import { PlaceDocument, TransitionDocument, ArcDocument, PetriNetStateDocument } from "../types/petriNet.types";
import { Types } from "mongoose";

export class PetriNetInitializer {
  private static readonly PLACES_CONFIG = [
    { nom: "OuvriersDisponibles", type: "ouvrier", tokens: 0 },
    { nom: "OuvriersOccupes", type: "ouvrier", tokens: 0 },
    { nom: "OuvriersAbsents", type: "ouvrier", tokens: 0 },
    { nom: "MachinesActives", type: "machine", tokens: 0 },
    { nom: "MachinesEnPanne", type: "machine", tokens: 0 },
    { nom: "MachinesEnMaintenance", type: "machine", tokens: 0 },
    { nom: "AteliersActifs", type: "atelier", tokens: 0 },
    { nom: "AteliersFermes", type: "atelier", tokens: 0 },
    { nom: "AteliersEnMaintenance", type: "atelier", tokens: 0 },
    { nom: "TachesEnAttente", type: "tache", tokens: 0 },
    { nom: "TachesEnCours", type: "tache", tokens: 0 },
    { nom: "TachesTerminees", type: "tache", tokens: 0 }
  ];

  private static readonly TRANSITIONS_CONFIG = [
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

  static async resetNetwork(): Promise<void> {
    await Promise.all([
      Place.deleteMany({}),
      Transition.deleteMany({}),
      Arc.deleteMany({}),
      PetriNetState.deleteMany({})
    ]);
  }

  static async createPlaces(): Promise<Map<string, string>> {
    const places = await Place.insertMany(this.PLACES_CONFIG) as PlaceDocument[];
    const placeMap = new Map<string, string>();
    places.forEach(place => {
      placeMap.set(place.nom, place._id.toString());
    });
    return placeMap;
  }

  static async createTransitions(): Promise<Map<string, string>> {
    const transitions = await Transition.insertMany(this.TRANSITIONS_CONFIG) as TransitionDocument[];
    const transitionMap = new Map<string, string>();
    transitions.forEach(transition => {
      transitionMap.set(transition.nom, transition._id.toString());
    });
    return transitionMap;
  }

  static async createArcs(placeMap: Map<string, string>, transitionMap: Map<string, string>): Promise<ArcDocument[]> {
    const arcsConfig = this.generateArcsConfig(placeMap, transitionMap);
    const validArcsData = arcsConfig.filter(arc => 
      arc.from && arc.to && Types.ObjectId.isValid(arc.from) && Types.ObjectId.isValid(arc.to)
    );
    
    if (validArcsData.length !== arcsConfig.length) {
      throw new Error("Some arcs have invalid from/to IDs");
    }

    return await Arc.insertMany(validArcsData) as ArcDocument[];
  }

  static async createInitialState(
    places: PlaceDocument[], 
    transitions: TransitionDocument[], 
    arcs: ArcDocument[]
  ): Promise<string> {
    const initialStateData: Record<string, number> = {};
    places.forEach(place => {
      initialStateData[place._id.toString()] = place.tokens;
    });

    const initialState = new PetriNetState({
      nom: "ReseauAtelierPrincipal",
      places: places.map(p => p._id.toString()),
      transitions: transitions.map(t => t._id.toString()),
      arcs: arcs.map(a => a._id.toString()),
      etatActuel: new Map(Object.entries(initialStateData)),
      historique: []
    }) as PetriNetStateDocument;

    await initialState.save();
    return initialState._id.toString();
  }

  private static generateArcsConfig(
    placeMap: Map<string, string>, 
    transitionMap: Map<string, string>
  ) {
    return [
      // Ouvriers
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
      // Tâches
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
  }
}