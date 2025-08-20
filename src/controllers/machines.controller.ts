import { Request, Response } from "express";
import { Machine } from "../models/machine.model";

// Lister toutes les machines
export const getAllMachines = async (_req: Request, res: Response) => {
    try {
        const machines = await Machine.find().populate('atelierId', 'nom localisation usage');
        res.json(machines);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des machines" });
    }
};

// Obtenir une machine par ID
export const getMachine = async (req: Request, res: Response) => {
    try {
        const machine = await Machine.findById(req.params.id).populate('atelierId', 'nom localisation usage');
        if (!machine) return res.status(404).json({ message: "Machine non trouvée" });
        res.json(machine);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de la machine" });
    }
};

// Créer une machine
export const createMachine = async (req: Request, res: Response) => {
    try {
        const newMachine = new Machine(req.body);
        await newMachine.save();
        res.status(201).json(newMachine);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la création de la machine" });
    }
};

// Mettre à jour une machine
export const updateMachine = async (req: Request, res: Response) => {
    try {
        const updated = await Machine.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Machine non trouvée" });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la mise à jour de la machine" });
    }
};

// Supprimer une machine
export const deleteMachine = async (req: Request, res: Response) => {
    try {
        const deleted = await Machine.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Machine non trouvée" });
        res.json(deleted);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de la machine" });
    }
};

// Filtrer par statut
export const filterByStatus = async (req: Request, res: Response) => {
    try {
        const status = String(req.params.status ?? "");
        const statusValides = ["active", "panne", "maintenance"];
        
        if (!statusValides.includes(status)) {
            return res.status(400).json({ message: "Statut invalide" });
        }
        
        const machines = await Machine.find({ status });
        res.json(machines);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du filtrage par statut" });
    }
};

// Filtrer par type
export const filterByType = async (req: Request, res: Response) => {
    try {
        const type = req.params.type;
        const machines = await Machine.find({ type });
        res.json(machines);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du filtrage par type" });
    }
};

// Lister les types disponibles
export const listTypes = async (_req: Request, res: Response) => {
    try {
        const types = await Machine.distinct("type");
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des types" });
    }
};

// Changer uniquement le statut d'une machine
export const updateMachineStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;

        // Vérification de la valeur du statut
        if (!["active", "panne", "maintenance"].includes(status)) {
            return res.status(400).json({ message: "Statut invalide" });
        }

        const updated = await Machine.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Machine non trouvée" });
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
    }
};

// Statistiques des machines
export const getMachinesStatistics = async (_req: Request, res: Response) => {
    try {
        const [total, actives, enPanne, maintenance] = await Promise.all([
            Machine.countDocuments(),
            Machine.countDocuments({ status: "active" }),
            Machine.countDocuments({ status: "panne" }),
            Machine.countDocuments({ status: "maintenance" })
        ]);

        const utilisationMoyenne = await Machine.aggregate([
            { $group: { _id: null, moyenne: { $avg: "$utilisation" } } }
        ]);

        res.json({
            total,
            actives,
            enPanne,
            maintenance,
            utilisationMoyenne: Math.round(utilisationMoyenne[0]?.moyenne || 0),
            tauxDisponibilite: total > 0 ? Math.round((actives / total) * 100) : 0
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du calcul des statistiques" });
    }
};

// Filtrer par usage
export const filterByUsage = async (req: Request, res: Response) => {
    try {
        const usage = req.params.usage;
        const machines = await Machine.find({ usage });
        res.json(machines);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du filtrage par usage" });
    }
};

// Lister les usages disponibles
export const listUsages = async (_req: Request, res: Response) => {
    try {
        const usages = await Machine.distinct("usage");
        res.json(usages);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des usages" });
    }
};