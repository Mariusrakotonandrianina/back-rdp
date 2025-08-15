import { Request, Response } from "express";
import { Machine } from "../models/machine.model";

// Lister toutes les machines
export const getAllMachines = async (_req: Request, res: Response) => {
  const machines = await Machine.find();
  res.json(machines);
};

// Obtenir une machine par ID
export const getMachine = async (req: Request, res: Response) => {
  const machine = await Machine.findById(req.params.id);
  if (!machine) return res.status(404).json({ message: "Machine non trouvée" });
  res.json(machine);
};

// Créer une machine
export const createMachine = async (req: Request, res: Response) => {
  const newMachine = new Machine(req.body);
  await newMachine.save();
  res.status(201).json(newMachine);
};

// Mettre à jour une machine
export const updateMachine = async (req: Request, res: Response) => {
  const updated = await Machine.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "Machine non trouvée" });
  res.json(updated);
};

// Supprimer une machine
export const deleteMachine = async (req: Request, res: Response) => {
  const deleted = await Machine.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Machine non trouvée" });
  res.json(deleted);
};

// Filtrer par statut
export const filterByStatus = async (req: Request, res: Response) => {
  const status = req.params.status;
  const machines = await Machine.find({ status });
  res.json(machines);
};

// Filtrer par type
export const filterByType = async (req: Request, res: Response) => {
  const type = req.params.type;
  const machines = await Machine.find({ type });
  res.json(machines);
};

// Lister les types disponibles
export const listTypes = async (_req: Request, res: Response) => {
  const types = await Machine.distinct("type");
  res.json(types);
};

// Changer uniquement le statut d'une machine
export const updateMachineStatus = async (req: Request, res: Response) => {
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
};

