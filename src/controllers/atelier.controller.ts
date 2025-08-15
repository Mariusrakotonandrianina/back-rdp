import { Request, Response } from "express";
import { Atelier } from "../models/atelier.model";

export const getAllAteliers = async (_req: Request, res: Response) => {
  const ateliers = await Atelier.find();
  res.json(ateliers);
};

export const getAtelier = async (req: Request, res: Response) => {
  const atelier = await Atelier.findById(req.params.id);
  if (!atelier) return res.status(404).json({ message: "Atelier non trouvé" });
  res.json(atelier);
};

export const createAtelier = async (req: Request, res: Response) => {
  const newAtelier = new Atelier(req.body);
  await newAtelier.save();
  res.status(201).json(newAtelier);
};

export const updateAtelier = async (req: Request, res: Response) => {
  const updated = await Atelier.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "Atelier non trouvé" });
  res.json(updated);
};

export const deleteAtelier = async (req: Request, res: Response) => {
  const deleted = await Atelier.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Atelier non trouvé" });
  res.json(deleted);
};

export const filterByStatus = async (req: Request, res: Response) => {
  const status = req.params.status;
  const ateliers = await Atelier.find({ status });
  res.json(ateliers);
};

export const filterByLocalisation = async (req: Request, res: Response) => {
  const localisation = req.params.localisation;
  const ateliers = await Atelier.find({ localisation });
  res.json(ateliers);
};

export const listLocalisations = async (_req: Request, res: Response) => {
  const localisations = await Atelier.distinct("localisation");
  res.json(localisations);
};
