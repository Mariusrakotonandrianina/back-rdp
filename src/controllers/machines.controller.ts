import { Request, Response } from "express";
import { Machine } from "../models/machine.model";

export const getAllMachines = async (_req: Request, res: Response) => {
  try {
    const machines = await Machine.find().populate(
      "atelierId",
      "nom localisation usage"
    );
    res.json(machines);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des machines" });
  }
};

export const getMachine = async (req: Request, res: Response) => {
  try {
    const machine = await Machine.findById(req.params.id).populate(
      "atelierId",
      "nom localisation usage"
    );
    if (!machine)
      return res.status(404).json({ message: "Machine non trouvée" });
    res.json(machine);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de la machine" });
  }
};

export const createMachine = async (req: Request, res: Response) => {
  try {
    const newMachine = new Machine(req.body);
    await newMachine.save();
    res.status(201).json(newMachine);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la création de la machine" });
  }
};

export const updateMachine = async (req: Request, res: Response) => {
  try {
    const updated = await Machine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated)
      return res.status(404).json({ message: "Machine non trouvée" });
    res.json(updated);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la mise à jour de la machine" });
  }
};

export const deleteMachine = async (req: Request, res: Response) => {
  try {
    const deleted = await Machine.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Machine non trouvée" });
    res.json(deleted);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la machine" });
  }
};

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

export const filterByType = async (req: Request, res: Response) => {
  try {
    const type = req.params.type;
    const machines = await Machine.find({ type });
    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du filtrage par type" });
  }
};

export const listTypes = async (_req: Request, res: Response) => {
  try {
    const types = await Machine.distinct("type");
    res.json(types);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des types" });
  }
};

export const updateMachineStatus = async (req: Request, res: Response) => {
  try {
    const status = req.params.status as string;
    const statusValides = ["active", "panne", "maintenance"];

    if (!status) {
      return res
        .status(400)
        .json({ message: "Paramètre status manquant dans l'URL" });
    }

    if (status === "cycle") {
      const machine = await Machine.findById(req.params.id);
      if (!machine) {
        return res.status(404).json({ message: "Atelier non trouvé" });
      }

      const cycleStatuts = {
        active: "panne",
        panne: "maintenance",
        maintenance: "active",
      };

      const nouveauStatut =
        cycleStatuts[machine.status as keyof typeof cycleStatuts];

      const updated = await Machine.findByIdAndUpdate(
        req.params.id,
        { status: nouveauStatut },
        { new: true }
      );

      return res.json({
        atelier: updated,
      });
    }

    if (!statusValides.includes(status)) {
      return res.status(400).json({
        message: `Statut invalide. Statuts autorisés: ${statusValides.join(
          ", "
        )} ou "cycle"`,
      });
    }

    const updated = await Machine.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Machine non trouvé" });
    }

    res.json({
      message: `Statut mis à jour vers "${status}"`,
      nouveauStatut: status,
      machine: updated,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du statut" });
  }
};

export const cycleMachineStatus = async (req: Request, res: Response) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      return res.status(404).json({ message: "Machine non trouvé" });
    }

    const cycleStatuts = {
      active: "panne",
      panne: "maintenance",
      maintenance: "active",
    };

    const nouveauStatut =
      cycleStatuts[machine.status as keyof typeof cycleStatuts];

    const updated = await Machine.findByIdAndUpdate(
      req.params.id,
      { status: nouveauStatut },
      { new: true }
    );

    res.json({
      machine: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du basculement du statut" });
  }
};

export const getMachinesStatistics = async (_req: Request, res: Response) => {
  try {
    const [total, actives, enPanne, maintenance] = await Promise.all([
      Machine.countDocuments(),
      Machine.countDocuments({ status: "active" }),
      Machine.countDocuments({ status: "panne" }),
      Machine.countDocuments({ status: "maintenance" }),
    ]);

    const utilisationMoyenne = await Machine.aggregate([
      { $group: { _id: null, moyenne: { $avg: "$utilisation" } } },
    ]);

    res.json({
      total,
      actives,
      enPanne,
      maintenance,
      utilisationMoyenne: Math.round(utilisationMoyenne[0]?.moyenne || 0),
      tauxDisponibilite: total > 0 ? Math.round((actives / total) * 100) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du calcul des statistiques" });
  }
};

export const filterByUsage = async (req: Request, res: Response) => {
  try {
    const usage = req.params.usage;
    const machines = await Machine.find({ usage });
    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du filtrage par usage" });
  }
};

export const listUsages = async (_req: Request, res: Response) => {
  try {
    const usages = await Machine.distinct("usage");
    res.json(usages);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des usages" });
  }
};
