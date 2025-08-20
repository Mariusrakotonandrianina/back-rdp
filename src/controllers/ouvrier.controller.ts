import { Request, Response } from "express";
import { Ouvrier, IOuvrier, StatutOuvrier } from "../models/ouvrier.model";

// Récupérer tous les ouvriers
export const getAllOuvriers = async (_req: Request, res: Response) => {
    try {
        const ouvriers = await Ouvrier.find().populate('ateliersAutorises', 'nom localisation usage');
        res.json(ouvriers);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des ouvriers" });
    }
};

// Récupérer un ouvrier par ID
export const getOuvrier = async (req: Request, res: Response) => {
    try {
        const ouvrier = await Ouvrier.findById(req.params.id).populate('ateliersAutorises', 'nom localisation usage');
        if (!ouvrier) return res.status(404).json({ message: "Ouvrier non trouvé" });
        res.json(ouvrier);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de l'ouvrier" });
    }
};

// Créer un ouvrier
export const createOuvrier = async (req: Request, res: Response) => {
    try {
        const newOuvrier = new Ouvrier(req.body);
        await newOuvrier.save();
        res.status(201).json(newOuvrier);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la création de l'ouvrier" });
    }
};

// Mettre à jour un ouvrier
export const updateOuvrier = async (req: Request, res: Response) => {
    try {
        const updated = await Ouvrier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Ouvrier non trouvé" });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la mise à jour de l'ouvrier" });
    }
};

// Supprimer un ouvrier
export const deleteOuvrier = async (req: Request, res: Response) => {
    try {
        const deleted = await Ouvrier.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Ouvrier non trouvé" });
        res.json(deleted);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de l'ouvrier" });
    }
};

// Filtrer par statut
export const getOuvriersByStatut = async (req: Request, res: Response) => {
    try {
        const statut = req.params.statut as StatutOuvrier;
        const statutsValides: StatutOuvrier[] = ["disponible", "occupe", "absent"];
        
        if (!statutsValides.includes(statut)) {
            return res.status(400).json({ 
                message: `Statut invalide. Statuts autorisés: ${statutsValides.join(", ")}` 
            });
        }
        
        const ouvriers = await Ouvrier.find({ statut }).populate('ateliersAutorises', 'nom usage');
        res.status(200).json(ouvriers);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du filtrage par statut" });
    }
};

// Filtrer par niveau
export const getOuvriersByNiveau = async (req: Request, res: Response) => {
    try {
        const niveau = String(req.params.niveau ?? "");
        const niveauxValides = ["Expert", "Confirmé", "Débutant"];
        
        if (!niveauxValides.includes(niveau)) {
            return res.status(400).json({ 
                message: `Niveau invalide. Niveaux autorisés: ${niveauxValides.join(", ")}` 
            });
        }
        
        const ouvriers = await Ouvrier.find({ niveau });
        res.json(ouvriers);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du filtrage par niveau" });
    }
};

// Filtrer par compétence
export const getOuvriersByCompetence = async (req: Request, res: Response) => {
    try {
        const competence = req.params.competence;
        const ouvriers = await Ouvrier.find({ competences: { $in: [competence] } });
        res.json(ouvriers);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du filtrage par compétence" });
    }
};

// Lister toutes les compétences disponibles
export const listCompetences = async (_req: Request, res: Response) => {
    try {
        const competences = await Ouvrier.distinct("competences");
        res.json(competences);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des compétences" });
    }
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

        // Logique métier : réinitialiser les tâches selon le statut
        if (statut === "disponible") {
            updateData.tacheActuelle = null;
            updateData.heuresJour = 0; // Remettre à zéro pour nouveau décompte
        } else if (statut === "absent") {
            updateData.tacheActuelle = null;
            updateData.tacheSuivante = null;
            updateData.heuresJour = 0;
        }
        // Si statut = "occupe", on garde les tâches actuelles

        const ouvrierMisAJour = await Ouvrier.findByIdAndUpdate(id, updateData, { new: true });
        
        res.json({
            message: `Statut mis à jour vers "${statut}"`,
            ouvrier: ouvrierMisAJour
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
    }
};

// Basculement automatique du statut (toggle)
export const toggleOuvrierStatut = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const ouvrierActuel = await Ouvrier.findById(id);
        
        if (!ouvrierActuel) {
            return res.status(404).json({ message: "Ouvrier non trouvé" });
        }

        let nouveauStatut: StatutOuvrier;
        let updateData: Partial<IOuvrier> = {};

        // Logique de basculement
        switch (ouvrierActuel.statut) {
            case "disponible":
                nouveauStatut = "occupe";
                // Garder la tâche suivante comme tâche actuelle si elle existe
                if (ouvrierActuel.tacheSuivante) {
                    updateData.tacheActuelle = ouvrierActuel.tacheSuivante;
                    updateData.tacheSuivante = null;
                }
                break;
            case "occupe":
                nouveauStatut = "disponible";
                updateData.tacheActuelle = null;
                updateData.heuresJour = 0;
                break;
            case "absent":
                nouveauStatut = "disponible";
                updateData.tacheActuelle = null;
                updateData.tacheSuivante = null;
                updateData.heuresJour = 0;
                break;
            default:
                nouveauStatut = "disponible";
                updateData.tacheActuelle = null;
                updateData.heuresJour = 0;
        }

        updateData.statut = nouveauStatut;

        const ouvrierMisAJour = await Ouvrier.findByIdAndUpdate(id, updateData, { new: true });

        res.json({
            message: `Statut basculé automatiquement de "${ouvrierActuel.statut}" vers "${nouveauStatut}"`,
            ancienStatut: ouvrierActuel.statut,
            nouveauStatut,
            ouvrier: ouvrierMisAJour
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du basculement du statut" });
    }
};

// Affecter une tâche à un ouvrier
export const affecterTache = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { tacheActuelle, tacheSuivante } = req.body;

        const ouvrier = await Ouvrier.findById(id);
        if (!ouvrier) {
            return res.status(404).json({ message: "Ouvrier non trouvé" });
        }

        let updateData: Partial<IOuvrier> = {};

        if (tacheActuelle) {
            updateData.tacheActuelle = tacheActuelle;
            updateData.statut = "occupe";
        }

        if (tacheSuivante) {
            updateData.tacheSuivante = tacheSuivante;
        }

        const ouvrierMisAJour = await Ouvrier.findByIdAndUpdate(id, updateData, { new: true });

        res.json({
            message: "Tâche(s) affectée(s) avec succès",
            ouvrier: ouvrierMisAJour
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'affectation de la tâche" });
    }
};

// Libérer un ouvrier (terminer sa tâche actuelle)
export const libererOuvrier = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const ouvrier = await Ouvrier.findById(id);
        if (!ouvrier) {
            return res.status(404).json({ message: "Ouvrier non trouvé" });
        }

        let updateData: Partial<IOuvrier> = {
            statut: "disponible",
            tacheActuelle: null,
            heuresJour: 0
        };

        // Si il y a une tâche suivante, la promouvoir comme tâche actuelle
        if (ouvrier.tacheSuivante) {
            updateData.tacheActuelle = ouvrier.tacheSuivante;
            updateData.tacheSuivante = null;
            updateData.statut = "occupe";
        }

        const ouvrierMisAJour = await Ouvrier.findByIdAndUpdate(id, updateData, { new: true });

        res.json({
            message: "Ouvrier libéré avec succès",
            tacheTerminee: ouvrier.tacheActuelle,
            nouvelleTacheActuelle: updateData.tacheActuelle,
            ouvrier: ouvrierMisAJour
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la libération de l'ouvrier" });
    }
};

// Mettre à jour les heures de travail
export const updateHeuresTravail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { heuresJour } = req.body;

        if (typeof heuresJour !== 'number' || heuresJour < 0) {
            return res.status(400).json({ message: "Nombre d'heures invalide" });
        }

        const ouvrier = await Ouvrier.findById(id);
        if (!ouvrier) {
            return res.status(404).json({ message: "Ouvrier non trouvé" });
        }

        // Vérifier que les heures ne dépassent pas le maximum
        if (heuresJour > ouvrier.heuresMax) {
            return res.status(400).json({ 
                message: `Heures dépassent le maximum autorisé (${ouvrier.heuresMax}h)` 
            });
        }

        const ouvrierMisAJour = await Ouvrier.findByIdAndUpdate(
            id, 
            { heuresJour }, 
            { new: true }
        );

        res.json({
            message: "Heures de travail mises à jour",
            heuresJour,
            heuresRestantes: ouvrier.heuresMax - heuresJour,
            ouvrier: ouvrierMisAJour
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour des heures" });
    }
};

// Statistiques détaillées
export const getOuvriersStatistics = async (_req: Request, res: Response) => {
    try {
        const [
            total, 
            disponibles, 
            occupes, 
            absents,
            experts,
            confirmes,
            debutants
        ] = await Promise.all([
            Ouvrier.countDocuments(),
            Ouvrier.countDocuments({ statut: "disponible" }),
            Ouvrier.countDocuments({ statut: "occupe" }),
            Ouvrier.countDocuments({ statut: "absent" }),
            Ouvrier.countDocuments({ niveau: "Expert" }),
            Ouvrier.countDocuments({ niveau: "Confirmé" }),
            Ouvrier.countDocuments({ niveau: "Débutant" })
        ]);

        // Statistiques sur les heures de travail
        const heuresStats = await Ouvrier.aggregate([
            {
                $group: {
                    _id: null,
                    totalHeuresJour: { $sum: "$heuresJour" },
                    totalHeuresMax: { $sum: "$heuresMax" },
                    moyenneHeuresJour: { $avg: "$heuresJour" },
                    moyenneHeuresMax: { $avg: "$heuresMax" }
                }
            }
        ]);

        // Répartition par compétences
        const competencesStats = await Ouvrier.aggregate([
            { $unwind: "$competences" },
            { $group: { _id: "$competences", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const stats = heuresStats[0] || {};

        res.json({
            total,
            repartitionStatut: {
                disponibles,
                occupes,
                absents
            },
            repartitionNiveau: {
                experts,
                confirmes,
                debutants
            },
            heures: {
                totalHeuresJour: stats.totalHeuresJour || 0,
                totalHeuresMax: stats.totalHeuresMax || 0,
                moyenneHeuresJour: Math.round(stats.moyenneHeuresJour || 0),
                moyenneHeuresMax: Math.round(stats.moyenneHeuresMax || 0),
                tauxUtilisation: stats.totalHeuresMax > 0 ? 
                    Math.round((stats.totalHeuresJour / stats.totalHeuresMax) * 100) : 0
            },
            competences: competencesStats.slice(0, 10), // Top 10 des compétences
            tauxDisponibilite: total > 0 ? Math.round((disponibles / total) * 100) : 0,
            tauxOccupation: total > 0 ? Math.round((occupes / total) * 100) : 0
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du calcul des statistiques" });
    }
};

// Recherche d'ouvriers par critères multiples
export const searchOuvriers = async (req: Request, res: Response) => {
    try {
        const { 
            competences, 
            niveau, 
            statut, 
            heuresDisponibles,
            atelierId 
        } = req.query;

        let query: any = {};

        if (competences) {
            const competencesList = (competences as string).split(',');
            query.competences = { $in: competencesList };
        }

        if (niveau) {
            query.niveau = niveau;
        }

        if (statut) {
            query.statut = statut;
        }

        if (heuresDisponibles) {
            const heuresMin = parseInt(heuresDisponibles as string);
            query.$expr = { 
                $gte: [{ $subtract: ["$heuresMax", "$heuresJour"] }, heuresMin] 
            };
        }

        if (atelierId) {
            query.ateliersAutorises = atelierId;
        }

        const ouvriers = await Ouvrier.find(query)
            .populate('ateliersAutorises', 'nom usage')
            .sort({ niveau: 1, nom: 1 });

        res.json({
            criteres: req.query,
            resultats: ouvriers.length,
            ouvriers
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la recherche" });
    }
};