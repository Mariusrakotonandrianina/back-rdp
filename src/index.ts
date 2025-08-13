import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // <-- import du middleware
dotenv.config();

import { connectDB } from "./database";
import machinesRoutes from "./routes/machines.routes";
import outilsRoutes from "./routes/outils.routes";
import ouvriersRoutes from "./routes/ouvriers.routes";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: "*" })); // ou mettre l'URL de ton frontend à la place de "*"
app.use(express.json());

// Routes
app.use("/machines", machinesRoutes);
app.use("/outils", outilsRoutes);
app.use("/ouvriers", ouvriersRoutes);

// Connexion à la BD puis démarrage serveur
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
  });
});
