import { Request, Response } from "express";
import { Ouvrier } from "../models/ouvrier.model";

export const getAllOuvriers = async (_req: Request, res: Response) => {
    const ouvriers = await Ouvrier.find();
    res.json(ouvriers);
};

export const getOuvrier = async (req: Request, res: Response) => {
    const ouvrier = await Ouvrier.findById(req.params.id);
    if (!ouvrier) return res.status(404).json({ message: "Ouvrier non trouvé" });
    res.json(ouvrier);
};

export const createOuvrier = async (req: Request, res: Response) => {
    const newOuvrier = new Ouvrier(req.body);
    await newOuvrier.save();
    res.status(201).json(newOuvrier);
};

export const updateOuvrier = async (req: Request, res: Response) => {
    const updated = await Ouvrier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Ouvrier non trouvé" });
    res.json(updated);
};

export const deleteOuvrier = async (req: Request, res: Response) => {
    const deleted = await Ouvrier.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Ouvrier non trouvé" });
    res.json(deleted);
};

export const filterByStatus = async (req: Request, res: Response) => {
    const status = req.params.status;
    const ouvries = await Ouvrier.find({ status });
    res.status(200).json(ouvries);
};