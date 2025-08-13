import { Router } from "express";
import {
    getAllOutils,
    getOutil,
    updateOutil,
    deleteOutil,
    filterByType,
    listTypes,
    createOutil,
} from "../controllers/outil.controller";

const outilsRoutes = Router();

outilsRoutes.get("/", getAllOutils);
outilsRoutes.get("/:id", getOutil);
outilsRoutes.post("/", createOutil);
outilsRoutes.put("/:id", updateOutil);
outilsRoutes.delete("/:id", deleteOutil);
outilsRoutes.get("/type/:type", filterByType);
outilsRoutes.get("/meta/types", listTypes);

export default outilsRoutes;