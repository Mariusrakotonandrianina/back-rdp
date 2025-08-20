import { Router } from "express";
import {
    getAllAteliers,
    getAtelier,
    createAtelier,
    updateAtelier,
    deleteAtelier,
    filterByStatus,
    filterByLocalisation,
    listLocalisations,
    updateAtelierStatus,
    getAteliersStatistics,
    cycleAtelierStatus
} from "../controllers/atelier.controller";

const ateliersRoutes = Router();

// Routes spéciales d'abord
ateliersRoutes.get("/statistiques", getAteliersStatistics);
ateliersRoutes.get("/meta/localisations", listLocalisations);
ateliersRoutes.get("/status/:status", filterByStatus); // tsy mbola mande
ateliersRoutes.get("/localisation/:localisation", filterByLocalisation);

// Mise à jour du statut
ateliersRoutes.patch("/:id/:status", updateAtelierStatus);      // Statut spécifique ou cycle
ateliersRoutes.patch("/:id/cycle-status", cycleAtelierStatus);

// Routes CRUD
ateliersRoutes.get("/", getAllAteliers);
ateliersRoutes.post("/", createAtelier);
ateliersRoutes.get("/:id", getAtelier);
ateliersRoutes.put("/:id", updateAtelier);
ateliersRoutes.delete("/:id", deleteAtelier);

export default ateliersRoutes;