import { Request, Response } from "express";
import { Ouvrier, IOuvrier, StatutOuvrier } from "../models/ouvrier.model";

// Récupérer tous les ouvriers
export const getAllOuvriers = async (_req: Request, res: Response) => {
    const ouvriers = await Ouvrier.find();
    res.json(ouvriers);
};

// Récupérer un ouvrier par ID
export const getOuvrier = async (req: Request, res: Response) => {
    const ouvrier = await Ouvrier.findById(req.params.id);
    if (!ouvrier) return res.status(404).json({ message: "Ouvrier non trouvé" });
    res.json(ouvrier);
};

// Créer un ouvrier
export const createOuvrier = async (req: Request, res: Response) => {
    const newOuvrier = new Ouvrier(req.body);
    await newOuvrier.save();
    res.status(201).json(newOuvrier);
};

// Mettre à jour un ouvrier
export const updateOuvrier = async (req: Request, res: Response) => {
    const updated = await Ouvrier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Ouvrier non trouvé" });
    res.json(updated);
};

// Supprimer un ouvrier
export const deleteOuvrier = async (req: Request, res: Response) => {
    const deleted = await Ouvrier.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Ouvrier non trouvé" });
    res.json(deleted);
};

// Filtrer par statut
export const getOuvriersByStatut = async (req: Request, res: Response) => {
    const statut = req.params.statut as StatutOuvrier;
    const statutsValides: StatutOuvrier[] = ["disponible", "occupe", "absent"];
    if (!statutsValides.includes(statut)) {
        return res.status(400).json({ message: "Statut invalide" });
    }
    const ouvriers = await Ouvrier.find({ statut });
    res.status(200).json(ouvriers);
};

// Mettre à jour uniquement le statut
export const updateOuvrierStatut = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { statut } = req.body as { statut: StatutOuvrier };

        const statutsValides: StatutOuvrier[] = ["disponible", "occupe", "absent"];
        if (!statut || !statutsValides.includes(statut)) {
            return res.status(400).json({
                message: `Statut invalide. Statuts autorisés: ${statutsValides.join(", ")}`
            });
        }

        const ouvrierActuel = await Ouvrier.findById(id);
        if (!ouvrierActuel) {
            return res.status(404).json({ message: "Ouvrier non trouvé" });
        }

        let updateData: Partial<IOuvrier> = { statut };

        if (statut === "disponible" || statut === "absent") {
            updateData.tacheActuelle = null;
        }

        const ouvrierMisAJour = await Ouvrier.findByIdAndUpdate(id, updateData, { new: true });
        res.json({
            message: `Statut mis à jour`,
            ouvrier: ouvrierMisAJour
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
    }
};

// Basculement automatique du statut
export const toggleOuvrierStatut = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const ouvrierActuel = await Ouvrier.findById(id);
        if (!ouvrierActuel) return res.status(404).json({ message: "Ouvrier non trouvé" });

        let nouveauStatut: StatutOuvrier;
        switch (ouvrierActuel.statut) {
            case "disponible":
                nouveauStatut = "occupe";
                break;
            case "occupe":
                nouveauStatut = "disponible";
                break;
            case "absent":
                nouveauStatut = "disponible";
                break;
            default:
                nouveauStatut = "disponible";
        }

        const ouvrierMisAJour = await Ouvrier.findByIdAndUpdate(
            id,
            { 
                statut: nouveauStatut,
                tacheActuelle: nouveauStatut === "disponible" ? null : ouvrierActuel.tacheActuelle
            },
            { new: true }
        );

        res.json({
            message: `Statut basculé automatiquement`,
            ouvrier: ouvrierMisAJour
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du basculement du statut" });
    }
};

// Statistiques
export const getOuvriersStatistics = async (_req: Request, res: Response) => {
    try {
        const [total, disponibles, occupes, absents] = await Promise.all([
            Ouvrier.countDocuments(),
            Ouvrier.countDocuments({ statut: "disponible" }),
            Ouvrier.countDocuments({ statut: "occupe" }),
            Ouvrier.countDocuments({ statut: "absent" })
        ]);

        res.json({
            total,
            disponibles,
            occupes,
            absents,
            tauxDisponibilite: total > 0 ? Math.round((disponibles / total) * 100) : 0
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du calcul des statistiques" });
    }
};
