import { Router } from "express";
import {
  initializeNetwork,
  getCurrentState,
  fireTransition,
  synchronizeState
} from "../controllers/petriNet.controller";

const petriNetRoutes = Router();

petriNetRoutes.post("/initialize", initializeNetwork);
petriNetRoutes.get("/state", getCurrentState);
petriNetRoutes.post("/fire/:transitionId", fireTransition);
petriNetRoutes.post("/synchronize", synchronizeState);

export default petriNetRoutes;