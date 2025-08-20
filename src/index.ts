import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import { connectDB } from "./database";
import machinesRoutes from "./routes/machines.routes";
import ouvriersRoutes from "./routes/ouvriers.routes";
import ateliersRoutes from "./routes/atelier.routes";
import petriNetRoutes from "./routes/petriNet.routes";
import tacheRoutes from "./routes/tache.routes";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/machines", machinesRoutes);
app.use("/ouvriers", ouvriersRoutes);
app.use("/ateliers", ateliersRoutes);
app.use("/petri-net", petriNetRoutes)
app.use("/taches", tacheRoutes);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
  });
});
