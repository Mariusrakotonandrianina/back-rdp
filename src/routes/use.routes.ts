import { Router } from "express";
import {
    getAllUses,
    getUse,
    createUse,
    updateUse,
    deleteUse,
} from "../controllers/use.controller";

const useRoutes = Router();
useRoutes.get("/", getAllUses);
useRoutes.get("/:id", getUse);
useRoutes.post("/", createUse);
useRoutes.put("/:id", updateUse);
useRoutes.delete("/:id", deleteUse);

export default useRoutes;