import { Request, Response } from "express";
import { PetriNetService } from "../services/petriNet.service";

const petriNetService = new PetriNetService("atelier-principal");

export const initializeNetwork = async (_req: Request, res: Response) => {
  try {
    const networkId = await petriNetService.initializeAtelierNetwork();
    res.json({ 
      message: "Réseau de Petri initialisé", 
      networkId 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de l'initialisation", 
      error 
    });
  }
};

export const getCurrentState = async (_req: Request, res: Response) => {
  try {
    const state = await petriNetService.getCurrentState();
    res.json(state);
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération de l'état", 
      error 
    });
  }
};

export const fireTransition = async (req: Request, res: Response) => {
  try {
    const { transitionId } = req.params;
    const success = await petriNetService.fireTransition(transitionId);
    
    if (success) {
      res.json({ message: "Transition tirée avec succès" });
    } else {
      res.status(400).json({ message: "Impossible de tirer cette transition" });
    }
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors du tir de transition", 
      error 
    });
  }
};

export const synchronizeState = async (_req: Request, res: Response) => {
  try {
    await petriNetService.synchronizeWithRealState();
    res.json({ message: "Synchronisation effectuée" });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la synchronisation", 
      error 
    });
  }
};