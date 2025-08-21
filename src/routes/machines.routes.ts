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
    getMachinesStatistics,
    cycleMachineStatus
} from "../controllers/machines.controller";

const machinesRoutes = Router();

machinesRoutes.get("/statistiques", getMachinesStatistics);
machinesRoutes.get("/meta/types", listTypes);
machinesRoutes.get("/meta/usages", listUsages);
machinesRoutes.get("/status/:status", filterByStatus);
machinesRoutes.get("/type/:type", filterByType);
machinesRoutes.get("/usage/:usage", filterByUsage);

machinesRoutes.patch("/:id/:status", updateMachineStatus);
machinesRoutes.patch("/:id/status/cycle-status", cycleMachineStatus);

machinesRoutes.get("/", getAllMachines);
machinesRoutes.post("/", createMachine);
machinesRoutes.get("/:id", getMachine);
machinesRoutes.put("/:id", updateMachine);
machinesRoutes.delete("/:id", deleteMachine);

export default machinesRoutes;