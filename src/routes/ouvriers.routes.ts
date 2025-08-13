import { Router } from "express";

import {
  getAllOuvriers,
  getOuvrier,
  createOuvrier,
  updateOuvrier,
  deleteOuvrier,
  filterByStatus,
} from "../controllers/ouvrier.controller";

const ouvriersRoutes = Router();

ouvriersRoutes.get("/", getAllOuvriers);
ouvriersRoutes.get("/:id", getOuvrier);
ouvriersRoutes.post("/", createOuvrier);
ouvriersRoutes.put("/:id", updateOuvrier);
ouvriersRoutes.delete("/:id", deleteOuvrier);
ouvriersRoutes.get("/status/:status", filterByStatus);

export default ouvriersRoutes;