import { Router } from "express";
import {
  getAllTaches,
  getTache,
  createTache,
  updateTache,
  deleteTache,
  getTachesByStatus,
  getTachesByPriorite,
  getTachesByType,
  updateTacheStatus,
  updateTachePriorite,
  getEnumValues,
  getTachesStatistics,
} from "../controllers/tache.controller";

const tacheRoutes = Router();

tacheRoutes.get("/statistiques", getTachesStatistics);
tacheRoutes.get("/meta/enums", getEnumValues);

tacheRoutes.get("/status/:status", getTachesByStatus);
tacheRoutes.get("/priorite/:priorite", getTachesByPriorite);
tacheRoutes.get("/type/:type", getTachesByType);

tacheRoutes.patch("/:id/status/:status", updateTacheStatus);
tacheRoutes.patch("/:id/priorite/:priorite", updateTachePriorite);

tacheRoutes.get("/", getAllTaches);
tacheRoutes.post("/", createTache);
tacheRoutes.put("/:id", updateTache);
tacheRoutes.get("/:id", getTache);
tacheRoutes.delete("/:id", deleteTache);

export default tacheRoutes;
