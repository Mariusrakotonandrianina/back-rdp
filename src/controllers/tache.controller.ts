import { Request, Response } from "express";
import { Tache } from "../models/tache.model";

type TacheStatus = "en_attente" | "en_cours" | "terminee" | "annulee";
type TachePriorite = "basse" | "normale" | "haute" | "critique";
type TacheType = "affectation" | "liberation" | "maintenance" | "production";

export const getAllTaches = async (_req: Request, res: Response) => {
  try {
    const taches = await Tache.find()
      .populate("ressourcesRequises.ateliers", "nom usage")
      .populate("ressourcesRequises.machines", "nom type usage");
    res.json(taches);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des tâches" });
  }
};

export const getTache = async (req: Request, res: Response) => {
  try {
    const tache = await Tache.findById(req.params.id)
      .populate("ressourcesRequises.ateliers", "nom usage")
      .populate("ressourcesRequises.machines", "nom type usage");
    if (!tache) return res.status(404).json({ message: "Tâche non trouvée" });
    res.json(tache);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de la tâche" });
  }
};

export const createTache = async (req: Request, res: Response) => {
  try {
    const { status, priorite, type } = req.body;

    const statusValides: TacheStatus[] = [
      "en_attente",
      "en_cours",
      "terminee",
      "annulee",
    ];
    const prioritesValides: TachePriorite[] = [
      "basse",
      "normale",
      "haute",
      "critique",
    ];
    const typesValides: TacheType[] = [
      "affectation",
      "liberation",
      "maintenance",
      "production",
    ];

    if (status && !statusValides.includes(status)) {
      return res.status(400).json({
        message: `Statut invalide. Valeurs autorisées: ${statusValides.join(
          ", "
        )}`,
      });
    }

    if (priorite && !prioritesValides.includes(priorite)) {
      return res.status(400).json({
        message: `Priorité invalide. Valeurs autorisées: ${prioritesValides.join(
          ", "
        )}`,
      });
    }

    if (type && !typesValides.includes(type)) {
      return res.status(400).json({
        message: `Type invalide. Valeurs autorisées: ${typesValides.join(
          ", "
        )}`,
      });
    }

    const newTache = new Tache(req.body);
    await newTache.save();
    res.status(201).json(newTache);
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de la création de la tâche" });
  }
};

export const updateTache = async (req: Request, res: Response) => {
  try {
    const { status, priorite, type } = req.body;

    const statusValides: TacheStatus[] = [
      "en_attente",
      "en_cours",
      "terminee",
      "annulee",
    ];
    const prioritesValides: TachePriorite[] = [
      "basse",
      "normale",
      "haute",
      "critique",
    ];
    const typesValides: TacheType[] = [
      "affectation",
      "liberation",
      "maintenance",
      "production",
    ];

    if (status && !statusValides.includes(status)) {
      return res.status(400).json({
        message: `Statut invalide. Valeurs autorisées: ${statusValides.join(
          ", "
        )}`,
      });
    }

    if (priorite && !prioritesValides.includes(priorite)) {
      return res.status(400).json({
        message: `Priorité invalide. Valeurs autorisées: ${prioritesValides.join(
          ", "
        )}`,
      });
    }

    if (type && !typesValides.includes(type)) {
      return res.status(400).json({
        message: `Type invalide. Valeurs autorisées: ${typesValides.join(
          ", "
        )}`,
      });
    }

    const updated = await Tache.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Tâche non trouvée" });
    res.json(updated);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la mise à jour de la tâche" });
  }
};

export const deleteTache = async (req: Request, res: Response) => {
  try {
    const deleted = await Tache.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Tâche non trouvée" });
    res.json(deleted);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la tâche" });
  }
};

export const getTachesByStatus = async (req: Request, res: Response) => {
  try {
    const status = req.params.status as TacheStatus;
    const statusValides: TacheStatus[] = [
      "en_attente",
      "en_cours",
      "terminee",
      "annulee",
    ];

    if (!statusValides.includes(status)) {
      return res.status(400).json({
        message: `Statut invalide. Valeurs autorisées: ${statusValides.join(
          ", "
        )}`,
      });
    }

    const taches = await Tache.find({ status })
      .populate("ressourcesRequises.ateliers", "nom usage")
      .populate("ressourcesRequises.machines", "nom type usage");
    res.json(taches);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du filtrage par statut" });
  }
};

export const getTachesByPriorite = async (req: Request, res: Response) => {
  try {
    const priorite = req.params.priorite as TachePriorite;
    const prioritesValides: TachePriorite[] = [
      "basse",
      "normale",
      "haute",
      "critique",
    ];

    if (!prioritesValides.includes(priorite)) {
      return res.status(400).json({
        message: `Priorité invalide. Valeurs autorisées: ${prioritesValides.join(
          ", "
        )}`,
      });
    }

    const taches = await Tache.find({ priorite })
      .populate("ressourcesRequises.ateliers", "nom usage")
      .populate("ressourcesRequises.machines", "nom type usage");
    res.json(taches);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du filtrage par priorité" });
  }
};

export const getTachesByType = async (req: Request, res: Response) => {
  try {
    const type = req.params.type as TacheType;
    const typesValides: TacheType[] = [
      "affectation",
      "liberation",
      "maintenance",
      "production",
    ];

    if (!typesValides.includes(type)) {
      return res.status(400).json({
        message: `Type invalide. Valeurs autorisées: ${typesValides.join(
          ", "
        )}`,
      });
    }

    const taches = await Tache.find({ type })
      .populate("ressourcesRequises.ateliers", "nom usage")
      .populate("ressourcesRequises.machines", "nom type usage");
    res.json(taches);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du filtrage par type" });
  }
};

export const updateTacheStatus = async (req: Request, res: Response) => {
  try {
    const status = req.params.status as string;
    const statusValides: TacheStatus[] = [
      "en_attente",
      "en_cours",
      "terminee",
      "annulee",
    ];

    // Vérifier que le paramètre status existe
    if (!status) {
      return res
        .status(400)
        .json({ message: "Paramètre status manquant dans l'URL" });
    }

    // Si le statut dans l'URL est "cycle", faire une rotation cyclique
    if (status === "cycle") {
      const tache = await Tache.findById(req.params.id);
      if (!tache) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }

      // Définir la rotation cyclique pour les statuts
      const cycleStatuts: Record<TacheStatus, TacheStatus> = {
        en_attente: "en_cours",
        en_cours: "terminee",
        terminee: "annulee",
        annulee: "en_attente",
      };

      const nouveauStatut = cycleStatuts[tache.status];
      let updateData: any = { status: nouveauStatut };

      // Mise à jour automatique des dates selon le nouveau statut
      if (nouveauStatut === "en_cours") {
        updateData.dateDebut = new Date();
      }
      if (nouveauStatut === "terminee") {
        updateData.dateFin = new Date();
      }

      const updated = await Tache.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      });

      return res.json({
        message: `Statut basculé de "${tache.status}" vers "${nouveauStatut}"`,
        ancienStatut: tache.status,
        nouveauStatut,
        cycle: "en_attente → en_cours → terminee → annulee → en_attente",
        tache: updated,
      });
    }

    // Sinon, vérifier que le statut est valide
    if (!statusValides.includes(status as TacheStatus)) {
      return res.status(400).json({
        message: `Statut invalide. Valeurs autorisées: ${statusValides.join(
          ", "
        )} ou "cycle"`,
      });
    }

    let updateData: any = { status };

    // Mise à jour automatique des dates
    if (status === "en_cours") {
      updateData.dateDebut = new Date();
    }
    if (status === "terminee") {
      updateData.dateFin = new Date();
    }

    const updated = await Tache.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }

    res.json({
      message: `Statut mis à jour vers "${status}"`,
      nouveauStatut: status,
      tache: updated,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du statut" });
  }
};

export const updateTachePriorite = async (req: Request, res: Response) => {
  try {
    const priorite = req.params.priorite as string;
    const prioritesValides: TachePriorite[] = [
      "basse",
      "normale",
      "haute",
      "critique",
    ];

    // Vérifier que le paramètre priorité existe
    if (!priorite) {
      return res
        .status(400)
        .json({ message: "Paramètre priorite manquant dans l'URL" });
    }

    // Si la priorité dans l'URL est "cycle", faire une rotation cyclique
    if (priorite === "cycle") {
      const tache = await Tache.findById(req.params.id);
      if (!tache) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }

      // Définir la rotation cyclique pour les priorités
      const cyclePriorites: Record<TachePriorite, TachePriorite> = {
        basse: "normale",
        normale: "haute",
        haute: "critique",
        critique: "basse",
      };

      const nouvellePriorite = cyclePriorites[tache.priorite];

      const updated = await Tache.findByIdAndUpdate(
        req.params.id,
        { priorite: nouvellePriorite },
        { new: true }
      );

      return res.json({
        message: `Priorité basculée de "${tache.priorite}" vers "${nouvellePriorite}"`,
        anciennePriorite: tache.priorite,
        nouvellePriorite,
        cycle: "basse → normale → haute → critique → basse",
        tache: updated,
      });
    }

    // Sinon, vérifier que la priorité est valide
    if (!prioritesValides.includes(priorite as TachePriorite)) {
      return res.status(400).json({
        message: `Priorité invalide. Valeurs autorisées: ${prioritesValides.join(
          ", "
        )} ou "cycle"`,
      });
    }

    const updated = await Tache.findByIdAndUpdate(
      req.params.id,
      { priorite },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }

    res.json({
      message: `Priorité mise à jour vers "${priorite}"`,
      nouvellePriorite: priorite,
      tache: updated,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de la priorité" });
  }
};

export const getEnumValues = async (_req: Request, res: Response) => {
  try {
    const statusValides: TacheStatus[] = [
      "en_attente",
      "en_cours",
      "terminee",
      "annulee",
    ];
    const prioritesValides: TachePriorite[] = [
      "basse",
      "normale",
      "haute",
      "critique",
    ];
    const typesValides: TacheType[] = [
      "affectation",
      "liberation",
      "maintenance",
      "production",
    ];

    res.json({
      status: statusValides,
      priorites: prioritesValides,
      types: typesValides,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des valeurs d'enum" });
  }
};

export const getTachesStatistics = async (_req: Request, res: Response) => {
  try {
    const [total, enAttente, enCours, terminees, annulees] = await Promise.all([
      Tache.countDocuments(),
      Tache.countDocuments({ status: "en_attente" }),
      Tache.countDocuments({ status: "en_cours" }),
      Tache.countDocuments({ status: "terminee" }),
      Tache.countDocuments({ status: "annulee" }),
    ]);

    // Statistiques par priorité
    const [basse, normale, haute, critique] = await Promise.all([
      Tache.countDocuments({ priorite: "basse" }),
      Tache.countDocuments({ priorite: "normale" }),
      Tache.countDocuments({ priorite: "haute" }),
      Tache.countDocuments({ priorite: "critique" }),
    ]);

    // Statistiques par type
    const [affectation, liberation, maintenance, production] =
      await Promise.all([
        Tache.countDocuments({ type: "affectation" }),
        Tache.countDocuments({ type: "liberation" }),
        Tache.countDocuments({ type: "maintenance" }),
        Tache.countDocuments({ type: "production" }),
      ]);

    res.json({
      total,
      repartitionStatus: {
        enAttente,
        enCours,
        terminees,
        annulees,
      },
      repartitionPriorite: {
        basse,
        normale,
        haute,
        critique,
      },
      repartitionType: {
        affectation,
        liberation,
        maintenance,
        production,
      },
      tauxCompletion: total > 0 ? Math.round((terminees / total) * 100) : 0,
      tauxEnCours: total > 0 ? Math.round((enCours / total) * 100) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du calcul des statistiques" });
  }
};
