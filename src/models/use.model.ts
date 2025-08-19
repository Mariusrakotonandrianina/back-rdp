import { Schema, model, Document } from "mongoose";

export interface IUse extends Document {
    usage: string;
}

const UseSchema = new Schema<IUse>({
    usage: { type: String, required: true },
});

export const Use = model<IUse>("Use", UseSchema);