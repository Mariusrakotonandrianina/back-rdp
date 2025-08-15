import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import { connectDB } from "./database";
import machinesRoutes from "./routes/machines.routes";
import outilsRoutes from "./routes/outils.routes";
import ouvriersRoutes from "./routes/ouvriers.routes";
import ateliersRoutes from "./routes/atelier.routes";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/machines", machinesRoutes);
app.use("/outils", outilsRoutes);
app.use("/ouvriers", ouvriersRoutes);
app.use("/ateliers", ateliersRoutes);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
  });
});
