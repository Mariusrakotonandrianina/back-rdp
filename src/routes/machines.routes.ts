import { Router } from "express";
import {
    getAllMachines,
    getMachine,
    createMachine,
    updateMachine,
    deleteMachine,
    filterByStatus,
    filterByType,
    filterByUsage,
    listTypes,
    listUsages,
    updateMachineStatus,
    getMachinesStatistics
} from "../controllers/machines.controller";

const machinesRoutes = Router();

// Routes spéciales d'abord (pour éviter les conflits)
machinesRoutes.get("/statistiques", getMachinesStatistics);
machinesRoutes.get("/meta/types", listTypes);
machinesRoutes.get("/meta/usages", listUsages);
machinesRoutes.get("/status/:status", filterByStatus);
machinesRoutes.get("/type/:type", filterByType);
machinesRoutes.get("/usage/:usage", filterByUsage);

// Mise à jour du statut
machinesRoutes.patch("/:id/status", updateMachineStatus);

// Routes CRUD
machinesRoutes.get("/", getAllMachines);
machinesRoutes.post("/", createMachine);
machinesRoutes.get("/:id", getMachine);
machinesRoutes.put("/:id", updateMachine);
machinesRoutes.delete("/:id", deleteMachine);

export default machinesRoutes;