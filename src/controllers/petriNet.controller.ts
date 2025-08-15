import { Request, Response } from "express";
import { PetriNetService } from "../services/petriNet.service";

const petriNetService = new PetriNetService("atelier-principal");

export const initializeNetwork = async (_req: Request, res: Response) => {
  try {
    const networkId = await petriNetService.initializeAtelierNetwork();
    res.json({ 
      message: "Réseau de Petri initialisé avec succès", 
      networkId 
    });
  } catch (error) {
    console.error("Erreur initialisation réseau:", error);
    res.status(500).json({ 
      message: "Erreur lors de l'initialisation du réseau", 
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};

export const getCurrentState = async (_req: Request, res: Response) => {
  try {
    const state = await petriNetService.getCurrentState();
    
    if (!state) {
      return res.status(404).json({ 
        message: "Aucun réseau de Petri trouvé. Initialisez d'abord le réseau." 
      });
    }
    
    res.json({
      message: "État du réseau récupéré avec succès",
      data: state
    });
  } catch (error) {
    console.error("Erreur récupération état:", error);
    res.status(500).json({ 
      message: "Erreur lors de la récupération de l'état", 
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};

export const fireTransition = async (req: Request, res: Response) => {
  try {
    const { transitionId } = req.params;
    
    if (!transitionId || transitionId.trim() === '') {
      return res.status(400).json({ 
        message: "ID de transition requis" 
      });
    }

    const result = await petriNetService.fireTransition(transitionId);
    
    if (result.success) {
      res.json({ 
        message: "Transition tirée avec succès",
        transitionId,
        newState: result.newState
      });
    } else {
      res.status(400).json({ 
        message: result.message || "Impossible de tirer cette transition",
        transitionId
      });
    }
  } catch (error) {
    console.error("Erreur tir transition:", error);
    res.status(500).json({ 
      message: "Erreur lors du tir de transition", 
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};

export const synchronizeState = async (_req: Request, res: Response) => {
  try {
    const result = await petriNetService.synchronizeWithRealState();
    res.json({ 
      message: "Synchronisation effectuée avec succès",
      synchronizedCounts: result
    });
  } catch (error) {
    console.error("Erreur synchronisation:", error);
    res.status(500).json({ 
      message: "Erreur lors de la synchronisation", 
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};

export const getNetworkInfo = async (_req: Request, res: Response) => {
  try {
    const info = await petriNetService.getNetworkInfo();
    res.json({
      message: "Informations du réseau récupérées",
      data: info
    });
  } catch (error) {
    console.error("Erreur info réseau:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des informations",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};

export const resetNetwork = async (_req: Request, res: Response) => {
  try {
    await petriNetService.resetNetwork();
    res.json({
      message: "Réseau réinitialisé avec succès"
    });
  } catch (error) {
    console.error("Erreur reset réseau:", error);
    res.status(500).json({
      message: "Erreur lors de la réinitialisation",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};