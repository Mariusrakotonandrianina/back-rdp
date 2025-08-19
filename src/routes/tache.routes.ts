import { Router } from "express";
import {
    getAllTaches,
    getTache,
    createTache,
    updateTache,
    deleteTache,
    getTachesByStatus,
    getTachesByPriorite,
    updateTacheStatus,
    getTachesStatistics
} from "../controllers/tache.controller";

const tacheRoutes = Router();

tacheRoutes.get("/status/:status", getTachesByStatus);
tacheRoutes.get("/priorite/:priorite", getTachesByPriorite);
tacheRoutes.get("/statistiques", getTachesStatistics);

tacheRoutes.get("/", getAllTaches);
tacheRoutes.post("/", createTache);
tacheRoutes.put("/:id", updateTache);
tacheRoutes.patch("/:id/status", updateTacheStatus);
tacheRoutes.get("/:id", getTache);
tacheRoutes.delete("/:id", deleteTache);

export default tacheRoutes;
