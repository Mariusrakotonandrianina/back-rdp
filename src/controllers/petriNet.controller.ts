// src/controllers/petriNet.controller.ts - Version mise à jour avec le service fourni

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
    
    // Récupérer l'état mis à jour après synchronisation
    const updatedState = await petriNetService.getCurrentState();
    
    res.json({ 
      message: "Synchronisation effectuée avec succès",
      synchronizedCounts: result,
      data: updatedState
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

export const getPlaces = async (_req: Request, res: Response) => {
  try {
    const state = await petriNetService.getCurrentState();
    
    if (!state) {
      return res.status(404).json({ 
        message: "Aucun réseau de Petri trouvé" 
      });
    }
    
    res.json({
      message: "Places récupérées avec succès",
      data: state.places || []
    });
  } catch (error) {
    console.error("Erreur récupération places:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des places",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};

export const getTransitions = async (_req: Request, res: Response) => {
  try {
    const state = await petriNetService.getCurrentState();
    
    if (!state) {
      return res.status(404).json({ 
        message: "Aucun réseau de Petri trouvé" 
      });
    }
    
    res.json({
      message: "Transitions récupérées avec succès",
      data: {
        activables: state.transitionsActivables || [],
        total: state.transitionsActivables?.length || 0
      }
    });
  } catch (error) {
    console.error("Erreur récupération transitions:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des transitions",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};

export const isTransitionEnabled = async (req: Request, res: Response) => {
  try {
    const { transitionId } = req.params;
    
    if (!transitionId || transitionId.trim() === '') {
      return res.status(400).json({ 
        message: "ID de transition requis" 
      });
    }

    const isEnabled = await petriNetService.isTransitionEnabled(transitionId);
    
    res.json({
      message: "Vérification effectuée",
      transitionId,
      enabled: isEnabled
    });
  } catch (error) {
    console.error("Erreur vérification transition:", error);
    res.status(500).json({
      message: "Erreur lors de la vérification de la transition",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};

export const getSystemSummary = async (_req: Request, res: Response) => {
  try {
    const [state, networkInfo, realStateCounts] = await Promise.all([
      petriNetService.getCurrentState(),
      petriNetService.getNetworkInfo(),
      petriNetService.synchronizeWithRealState()
    ]);

    if (!state) {
      return res.status(404).json({ 
        message: "Aucun réseau de Petri trouvé" 
      });
    }

    const summary = {
      network: {
        totalPlaces: networkInfo.totalPlaces,
        totalTransitions: networkInfo.totalTransitions,
        totalArcs: networkInfo.totalArcs,
        placesWithTokens: networkInfo.placesWithTokens,
        enabledTransitions: networkInfo.enabledTransitions.length
      },
      tokens: {
        total: state.totalTokens,
        distribution: state.places?.reduce((acc, place) => {
          acc[place.type] = (acc[place.type] || 0) + place.tokens;
          return acc;
        }, {} as Record<string, number>) || {}
      },
      realState: realStateCounts,
      health: {
        synchronized: true,
        lastUpdate: new Date().toISOString()
      }
    };

    res.json({
      message: "Résumé du système récupéré",
      data: summary
    });
  } catch (error) {
    console.error("Erreur résumé système:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération du résumé",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
};