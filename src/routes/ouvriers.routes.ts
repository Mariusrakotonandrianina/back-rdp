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
    updateOuvrierStatut,
    toggleOuvrierStatut,
    affecterTache,
    libererOuvrier,
    updateHeuresTravail,
    getOuvriersStatistics,
    searchOuvriers
} from "../controllers/ouvrier.controller";

const ouvriersRoutes = Router();

// Routes spéciales d'abord (pour éviter les conflits)
ouvriersRoutes.get("/statistiques", getOuvriersStatistics);
ouvriersRoutes.get("/search", searchOuvriers);
ouvriersRoutes.get("/meta/competences", listCompetences);
ouvriersRoutes.get("/statut/:statut", getOuvriersByStatut);
ouvriersRoutes.get("/niveau/:niveau", getOuvriersByNiveau);
ouvriersRoutes.get("/competence/:competence", getOuvriersByCompetence);

// Routes de mise à jour spécialisées
ouvriersRoutes.patch("/:id/statut", updateOuvrierStatut);
ouvriersRoutes.patch("/:id/toggle-statut", toggleOuvrierStatut);
ouvriersRoutes.patch("/:id/affecter-tache", affecterTache);
ouvriersRoutes.patch("/:id/liberer", libererOuvrier);
ouvriersRoutes.patch("/:id/heures", updateHeuresTravail);

// Routes CRUD standard
ouvriersRoutes.get("/", getAllOuvriers);
ouvriersRoutes.post("/", createOuvrier);
ouvriersRoutes.get("/:id", getOuvrier);
ouvriersRoutes.put("/:id", updateOuvrier);
ouvriersRoutes.delete("/:id", deleteOuvrier);

export default ouvriersRoutes;