import { Schema, model, Document } from "mongoose";

export interface IOutil extends Document {
    nom: string;
    type: string;
    quantite: number;
    disponible: number;
    enUse: number;
}

const OutilSchema = new Schema<IOutil>({
    nom: { type: String, required: true },
    type: { type: String, required: true },
    quantite: { type: Number, required: true },
    disponible: { type: Number, required: true },
    enUse: { type: Number, required: true },
});

export const Outil = model<IOutil>("Outil", OutilSchema);

