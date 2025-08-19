import { Request, Response } from 'express';
import { Tache } from '../models/tache.model';

export const getAllTaches = async (_req: Request, res: Response) => {
    try {
        const taches = await Tache.find()
            .populate('ressourcesRequises.ateliers', 'nom usage')
            .populate('ressourcesRequises.machines', 'nom type usage');
        res.json(taches);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des tâches" });
    }
};

export const getTache = async (req: Request, res: Response) => {
    try {
        const tache = await Tache.findById(req.params.id)
            .populate('ressourcesRequises.ateliers', 'nom usage')
            .populate('ressourcesRequises.machines', 'nom type usage');
        if (!tache) return res.status(404).json({ message: "Tâche non trouvée" });
        res.json(tache);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de la tâche" });
    }
};

export const createTache = async (req: Request, res: Response) => {
    try {
        const newTache = new Tache(req.body);
        await newTache.save();
        res.status(201).json(newTache);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la création de la tâche" });
    }
};

export const updateTache = async (req: Request, res: Response) => {
    try {
        const updated = await Tache.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Tâche non trouvée" });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la mise à jour de la tâche" });
    }
};

export const deleteTache = async (req: Request, res: Response) => {
    try {
        const deleted = await Tache.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Tâche non trouvée" });
        res.json(deleted);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de la tâche" });
    }
};

// Filtrer par statut
export const getTachesByStatus = async (req: Request, res: Response) => {
    try {
        const status = String(req.params.status ?? "");
        const statusValides = ["en_attente", "en_cours", "terminee", "annulee"];
        
        if (!statusValides.includes(status)) {
            return res.status(400).json({ message: "Statut invalide" });
        }
        
        const taches = await Tache.find({ status });
        res.json(taches);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du filtrage par statut" });
    }
};

// Filtrer par priorité
export const getTachesByPriorite = async (req: Request, res: Response) => {
    try {
        const priorite = String(req.params.priorite ?? "");
        const prioritesValides = ["basse", "normale", "haute", "critique"];
        
        if (!prioritesValides.includes(priorite)) {
            return res.status(400).json({ message: "Priorité invalide" });
        }
        
        const taches = await Tache.find({ priorite });
        res.json(taches);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du filtrage par priorité" });
    }
};

// Mettre à jour le statut d'une tâche
export const updateTacheStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const statusValides = ["en_attente", "en_cours", "terminee", "annulee"];
        
        if (!statusValides.includes(status)) {
            return res.status(400).json({ message: "Statut invalide" });
        }
        
        let updateData: any = { status };
        
        // Mise à jour automatique des dates
        if (status === "en_cours" && !req.body.dateDebut) {
            updateData.dateDebut = new Date();
        }
        if (status === "terminee" && !req.body.dateFin) {
            updateData.dateFin = new Date();
        }
        
        const updated = await Tache.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        if (!updated) {
            return res.status(404).json({ message: "Tâche non trouvée" });
        }
        
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
    }
};

// Statistiques des tâches
export const getTachesStatistics = async (_req: Request, res: Response) => {
    try {
        const [total, enAttente, enCours, terminees, annulees] = await Promise.all([
            Tache.countDocuments(),
            Tache.countDocuments({ status: "en_attente" }),
            Tache.countDocuments({ status: "en_cours" }),
            Tache.countDocuments({ status: "terminee" }),
            Tache.countDocuments({ status: "annulee" })
        ]);

        res.json({
            total,
            enAttente,
            enCours,
            terminees,
            annulees,
            tauxCompletion: total > 0 ? Math.round((terminees / total) * 100) : 0
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du calcul des statistiques" });
    }
};