import { Request, Response } from "express";
import { Atelier } from "../models/atelier.model";

export const getAllAteliers = async (_req: Request, res: Response) => {
  try {
    const ateliers = await Atelier.find().populate(
      "machinesAssociees",
      "nom type status"
    );
    res.json(ateliers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des ateliers" });
  }
};

export const getAtelier = async (req: Request, res: Response) => {
  try {
    const atelier = await Atelier.findById(req.params.id).populate(
      "machinesAssociees",
      "nom type status"
    );
    if (!atelier)
      return res.status(404).json({ message: "Atelier non trouvé" });
    res.json(atelier);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'atelier" });
  }
};

export const createAtelier = async (req: Request, res: Response) => {
  try {
    const newAtelier = new Atelier(req.body);
    await newAtelier.save();
    res.status(201).json(newAtelier);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la création de l'atelier" });
  }
};

export const updateAtelier = async (req: Request, res: Response) => {
  try {
    const updated = await Atelier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated)
      return res.status(404).json({ message: "Atelier non trouvé" });
    res.json(updated);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la mise à jour de l'atelier" });
  }
};

export const deleteAtelier = async (req: Request, res: Response) => {
  try {
    const deleted = await Atelier.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Atelier non trouvé" });
    res.json(deleted);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'atelier" });
  }
};

export const filterByStatus = async (req: Request, res: Response) => {
  try {
    const status = req.params.status as string;
    const statusValides = ["actif", "ferme", "maintenance"];

    if (!statusValides.includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const ateliers = await Atelier.find({ status });
    res.json(ateliers);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du filtrage par statut" });
  }
};

export const filterByLocalisation = async (req: Request, res: Response) => {
  try {
    const localisation = req.params.localisation;
    const ateliers = await Atelier.find({ localisation });
    res.json(ateliers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors du filtrage par localisation" });
  }
};

export const listLocalisations = async (_req: Request, res: Response) => {
  try {
    const localisations = await Atelier.distinct("localisation");
    res.json(localisations);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des localisations" });
  }
};

export const updateAtelierStatus = async (req: Request, res: Response) => {
  try {
    // Récupérer le statut depuis l'URL (req.params.status) avec vérification TypeScript
    const status = req.params.status as string;
    const statusValides = ["actif", "ferme", "maintenance"];

    // Vérifier que le paramètre status existe
    if (!status) {
      return res
        .status(400)
        .json({ message: "Paramètre status manquant dans l'URL" });
    }

    // Si le statut dans l'URL est "cycle", faire une rotation cyclique
    if (status === "cycle") {
      const atelier = await Atelier.findById(req.params.id);
      if (!atelier) {
        return res.status(404).json({ message: "Atelier non trouvé" });
      }

      // Définir la rotation cyclique
      const cycleStatuts = {
        actif: "ferme",
        ferme: "maintenance",
        maintenance: "actif",
      };

      const nouveauStatut =
        cycleStatuts[atelier.status as keyof typeof cycleStatuts];

      const updated = await Atelier.findByIdAndUpdate(
        req.params.id,
        { status: nouveauStatut },
        { new: true }
      );

      return res.json({
        message: `Statut basculé de "${atelier.status}" vers "${nouveauStatut}"`,
        ancienStatut: atelier.status,
        nouveauStatut,
        cycle: "actif → ferme → maintenance → actif",
        atelier: updated,
      });
    }

    // Sinon, vérifier que le statut est valide
    if (!statusValides.includes(status)) {
      return res.status(400).json({
        message: `Statut invalide. Statuts autorisés: ${statusValides.join(
          ", "
        )} ou "cycle"`,
      });
    }

    // Mettre à jour avec le statut spécifique
    const updated = await Atelier.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Atelier non trouvé" });
    }

    res.json({
      message: `Statut mis à jour vers "${status}"`,
      nouveauStatut: status,
      atelier: updated,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du statut" });
  }
};

export const cycleAtelierStatus = async (req: Request, res: Response) => {
  try {
    const atelier = await Atelier.findById(req.params.id);
    if (!atelier) {
      return res.status(404).json({ message: "Atelier non trouvé" });
    }

    // Rotation cyclique : actif → ferme → maintenance → actif
    const cycleStatuts = {
      actif: "ferme",
      ferme: "maintenance",
      maintenance: "actif",
    };

    const nouveauStatut =
      cycleStatuts[atelier.status as keyof typeof cycleStatuts];

    const updated = await Atelier.findByIdAndUpdate(
      req.params.id,
      { status: nouveauStatut },
      { new: true }
    );

    res.json({
      atelier: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du basculement du statut" });
  }
};

export const getAteliersStatistics = async (_req: Request, res: Response) => {
  try {
    const [total, actifs, fermes, maintenance] = await Promise.all([
      Atelier.countDocuments(),
      Atelier.countDocuments({ status: "actif" }),
      Atelier.countDocuments({ status: "ferme" }),
      Atelier.countDocuments({ status: "maintenance" }),
    ]);

    const capaciteTotale = await Atelier.aggregate([
      { $group: { _id: null, total: { $sum: "$capaciteEmployes" } } },
    ]);

    res.json({
      total,
      actifs,
      fermes,
      maintenance,
      capaciteTotaleEmployes: capaciteTotale[0]?.total || 0,
      tauxActivite: total > 0 ? Math.round((actifs / total) * 100) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du calcul des statistiques" });
  }
};
