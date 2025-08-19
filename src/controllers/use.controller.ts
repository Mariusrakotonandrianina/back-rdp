import { Request, Response } from 'express';
import { Use } from '../models/use.model';

export const getAllUses = async (_req: Request, res: Response) => {
  const uses = await Use.find();
  res.json(uses);
};

export const getUse = async (req: Request, res: Response) => {
    const use = await Use.findById(req.params.id);
    if (!use) return res.status(404).json({ message: "Use non trouvé" });
    res.json(use);
};

export const createUse = async (req: Request, res: Response) => {
    const newUse = new Use(req.body);
    await newUse.save();
    res.status(201).json(newUse);
};

export const updateUse = async (req: Request, res: Response) => {
    const updated = await Use.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Use non trouvé" });
    res.json(updated);
};

export const deleteUse = async (req: Request, res: Response) => {
    const deleted = await Use.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Use non trouvé" });
    res.json(deleted);
};