import { Router } from "express";
import {
  getAllOuvriers,
  getOuvrier,
  createOuvrier,
  updateOuvrier,
  deleteOuvrier,
  getOuvriersByStatut,
  updateOuvrierStatut,
  toggleOuvrierStatut,
  getOuvriersStatistics
} from "../controllers/ouvrier.controller";

const ouvriersRoutes = Router();

// Routes statistiques et filtres
ouvriersRoutes.get("/statistiques", getOuvriersStatistics);
ouvriersRoutes.get("/statut/:statut", getOuvriersByStatut);

// Routes mise à jour statut
ouvriersRoutes.patch("/:id/statut", updateOuvrierStatut);
ouvriersRoutes.patch("/:id/toggle-statut", toggleOuvrierStatut);

// Routes CRUD
ouvriersRoutes.get("/", getAllOuvriers);
ouvriersRoutes.post("/", createOuvrier);
ouvriersRoutes.get("/:id", getOuvrier);
ouvriersRoutes.put("/:id", updateOuvrier);
ouvriersRoutes.delete("/:id", deleteOuvrier);

export default ouvriersRoutes;
