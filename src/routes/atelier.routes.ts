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
} from "../controllers/atelier.controller";

const ateliersRoutes = Router();

ateliersRoutes.get("/", getAllAteliers);
ateliersRoutes.get("/:id", getAtelier);
ateliersRoutes.post("/", createAtelier);
ateliersRoutes.put("/:id", updateAtelier);
ateliersRoutes.delete("/:id", deleteAtelier);

ateliersRoutes.get("/status/:status", filterByStatus);
ateliersRoutes.get("/localisation/:localisation", filterByLocalisation);
ateliersRoutes.get("/meta/localisations", listLocalisations);

export default ateliersRoutes;
