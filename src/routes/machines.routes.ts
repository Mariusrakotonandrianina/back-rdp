import { Router } from "express";
import {
  getAllMachines,
  getMachine,
  createMachine,
  updateMachine,
  deleteMachine,
  filterByStatus,
  filterByType,
  listTypes,
  updateMachineStatus
} from "../controllers/machines.controller";

const machinesRoutes = Router();

machinesRoutes.get("/", getAllMachines);
machinesRoutes.get("/:id", getMachine);
machinesRoutes.post("/", createMachine);
machinesRoutes.put("/:id", updateMachine);
machinesRoutes.delete("/:id", deleteMachine);

machinesRoutes.get("/status/:status", filterByStatus);
machinesRoutes.get("/type/:type", filterByType);
machinesRoutes.get("/meta/types", listTypes);
machinesRoutes.patch("/:id/status", updateMachineStatus);

export default machinesRoutes;
