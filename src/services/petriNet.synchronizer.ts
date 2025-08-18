import { Ouvrier } from "../models/ouvrier.model";
import { Machine } from "../models/machine.model";
import { Atelier } from "../models/atelier.model";
import { Place, PetriNetState } from "../models/petriNet.model";
import { PlaceDocument, PetriNetStateDocument, SynchronizationResult } from "../types/petriNet.types";

export class PetriNetSynchronizer {
  async synchronizeWithRealState(): Promise<SynchronizationResult> {
    try {
      const netState = await PetriNetState.findOne({ nom: "ReseauAtelierPrincipal" }) as PetriNetStateDocument | null;
      if (!netState) {
        throw new Error("État du réseau non trouvé");
      }

      const resourceCounts = await this.getResourceCounts();
      await this.updatePlacesAndState(netState, resourceCounts);

      return resourceCounts;
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
      throw new Error(`Échec de la synchronisation: ${error}`);
    }
  }

  private async getResourceCounts(): Promise<SynchronizationResult> {
    const [
      // Ouvriers
      ouvrierDisponibles, ouvrierOccupes, ouvrierAbsents,
      // Machines
      machinesActives, machinesEnPanne, machinesEnMaintenance,
      // Ateliers
      ateliersActifs, ateliersFermes, ateliersEnMaintenance
    ] = await Promise.all([
      Ouvrier.countDocuments({ statut: "disponible" }),
      Ouvrier.countDocuments({ statut: "occupe" }),
      Ouvrier.countDocuments({ statut: "absent" }),
      Machine.countDocuments({ status: "active" }),
      Machine.countDocuments({ status: "panne" }),
      Machine.countDocuments({ status: "maintenance" }),
      Atelier.countDocuments({ status: "actif" }),
      Atelier.countDocuments({ status: "ferme" }),
      Atelier.countDocuments({ status: "maintenance" })
    ]);

    return {
      ouvriers: { 
        disponibles: ouvrierDisponibles, 
        occupes: ouvrierOccupes, 
        absents: ouvrierAbsents 
      },
      machines: { 
        actives: machinesActives, 
        enPanne: machinesEnPanne, 
        enMaintenance: machinesEnMaintenance 
      },
      ateliers: { 
        actifs: ateliersActifs, 
        fermes: ateliersFermes, 
        enMaintenance: ateliersEnMaintenance 
      }
    };
  }

  private async updatePlacesAndState(
    netState: PetriNetStateDocument, 
    resourceCounts: SynchronizationResult
  ): Promise<void> {
    const places = await Place.find() as PlaceDocument[];
    
    for (const place of places) {
      const tokens = this.getTokensForPlace(place.nom, resourceCounts);
      const placeId = place._id.toString();
      
      place.tokens = tokens;
      await place.save();
      netState.etatActuel.set(placeId, tokens);
    }

    await netState.save();
  }

  private getTokensForPlace(placeName: string, resourceCounts: SynchronizationResult): number {
    const tokenMapping: Record<string, number> = {
      // Ouvriers
      "OuvriersDisponibles": resourceCounts.ouvriers.disponibles,
      "OuvriersOccupes": resourceCounts.ouvriers.occupes,
      "OuvriersAbsents": resourceCounts.ouvriers.absents,
      // Machines
      "MachinesActives": resourceCounts.machines.actives,
      "MachinesEnPanne": resourceCounts.machines.enPanne,
      "MachinesEnMaintenance": resourceCounts.machines.enMaintenance,
      // Ateliers
      "AteliersActifs": resourceCounts.ateliers.actifs,
      "AteliersFermes": resourceCounts.ateliers.fermes,
      "AteliersEnMaintenance": resourceCounts.ateliers.enMaintenance
    };

    return tokenMapping[placeName] || 0;
  }
}
