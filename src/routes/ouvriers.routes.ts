import { Router } from "express";
import {
    getAllOuvriers,
    getOuvrier,
    createOuvrier,
    updateOuvrier,
    deleteOuvrier,
    getOuvriersByStatut,
    getOuvriersByNiveau,
    getOuvriersByCompetence,
    listCompetences,
    updateOuvrierStatus,
    toggleOuvrierStatut,
    affecterTache,
    libererOuvrier,
    updateHeuresTravail,
    getOuvriersStatistics,
    searchOuvriers,
    cycleOuvrierStatus
} from "../controllers/ouvrier.controller";

const ouvriersRoutes = Router();

ouvriersRoutes.get("/statistiques", getOuvriersStatistics);
ouvriersRoutes.get("/search", searchOuvriers);
ouvriersRoutes.get("/meta/competences", listCompetences);
ouvriersRoutes.get("/statut/:statut", getOuvriersByStatut);
ouvriersRoutes.get("/niveau/:niveau", getOuvriersByNiveau);
ouvriersRoutes.get("/competence/:competence", getOuvriersByCompetence);

ouvriersRoutes.patch("/status/:id/:status", updateOuvrierStatus);
ouvriersRoutes.patch("/:id/status/cycle", cycleOuvrierStatus);
ouvriersRoutes.patch("/:id/toggle-statut", toggleOuvrierStatut);
ouvriersRoutes.patch("/:id/affecter-tache", affecterTache);
ouvriersRoutes.patch("/:id/liberer", libererOuvrier);
ouvriersRoutes.patch("/:id/heures", updateHeuresTravail);

ouvriersRoutes.get("/", getAllOuvriers);
ouvriersRoutes.post("/", createOuvrier);
ouvriersRoutes.get("/:id", getOuvrier);
ouvriersRoutes.put("/:id", updateOuvrier);
ouvriersRoutes.delete("/:id", deleteOuvrier);

export default ouvriersRoutes;