import { Request, Response } from "express";
import { Outil } from "../models/outil.model";

export const getAllOutils = async (_req: Request, res: Response) => {
  const outils = await Outil.find();
  res.json(outils);
};

export const getOutil = async (req: Request, res: Response) => {
  const outil = await Outil.findById(req.params.id);
  if (!outil) return res.status(404).json({ message: "Outil non trouvé" });
  res.json(outil);
};

export const createOutil = async (req: Request, res: Response) => {
    const newOutil = new Outil(req.body);
    await newOutil.save();
    res.status(201).json(newOutil);
};

export const updateOutil = async (req: Request, res: Response) => {
  const updated = await Outil.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "Outil non trouvé" });
  res.json(updated);
};

export const deleteOutil = async (req: Request, res: Response) => {
  const deleted = await Outil.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Outil non trouvé" });
  res.json(deleted);
};

export const filterByType = async (req: Request, res: Response) => {
    const type = req.params.type;
    const outils = await Outil.find({ type });
    res.json(outils);
};

export const listTypes = async (_req: Request, res: Response) => {
    const types = await Outil.distinct("type");
    res.json(types);
};