import { Atelier } from "../models/atelier.model";
import { Machine } from "../models/machine.model";
import { Ouvrier } from "../models/ouvrier.model";
import { Tache } from "../models/use.model";

export class ValidationRules {
  
    // Vérifier la cohérence usage atelier <-> machine
    static async validateAtelierMachineUsage(atelierId: string, machineId: string): Promise<boolean> {
      const atelier = await Atelier.findById(atelierId);
      const machine = await Machine.findById(machineId);
      
      if (!atelier || !machine) return false;
      
      return atelier.usage === machine.usage;
    }
    
    // Vérifier qu'un ouvrier a la compétence pour une tâche
    static async validateOuvrierCompetence(ouvrierId: string, tacheId: string): Promise<boolean> {
      const ouvrier = await Ouvrier.findById(ouvrierId);
      const tache = await Tache.findById(tacheId);
      
      if (!ouvrier || !tache) return false;
      
      return ouvrier.competences.includes(tache.usage);
    }
    
    static async validateOuvrierAtelier({ ouvrierId, atelierId }: { ouvrierId: string; atelierId: string; }): Promise<boolean> {
      const ouvrier = await Ouvrier.findById(ouvrierId);
      const atelier = await Atelier.findById(atelierId);
      
      if (!ouvrier || !atelier) return false;
      
      return ouvrier.competences.includes(atelier.usage);
    }
    
    // Trouver les ressources compatibles pour une tâche
    static async findCompatibleResources(tacheId: string) {
      const tache = await Tache.findById(tacheId);
      if (!tache) return null;
      
      const ateliers = await Atelier.find({ 
        usage: tache.usage, 
        status: "actif" 
      });
      
      const machines = await Machine.find({ 
        usage: tache.usage, 
        status: "active" 
      });
      
      const ouvriers = await Ouvrier.find({ 
        competences: { $in: [tache.usage] }, 
        statut: "disponible" 
      });
      
      return { ateliers, machines, ouvriers };
    }
  }
  
  // Export des modèles
  export { Atelier, Machine, Ouvrier, Tache };