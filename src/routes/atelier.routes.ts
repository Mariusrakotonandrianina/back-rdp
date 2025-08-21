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

ateliersRoutes.get("/statistiques", getAteliersStatistics);
ateliersRoutes.get("/meta/localisations", listLocalisations);
ateliersRoutes.get("/status/:status", filterByStatus);
ateliersRoutes.get("/localisation/:localisation", filterByLocalisation);

ateliersRoutes.patch("/:id/:status", updateAtelierStatus);
ateliersRoutes.patch("/:id/cycle-status", cycleAtelierStatus);

// Routes CRUD
ateliersRoutes.get("/", getAllAteliers);
ateliersRoutes.post("/", createAtelier);
ateliersRoutes.get("/:id", getAtelier);
ateliersRoutes.put("/:id", updateAtelier);
ateliersRoutes.delete("/:id", deleteAtelier);

export default ateliersRoutes;