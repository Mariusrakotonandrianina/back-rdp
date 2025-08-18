import { Types } from "mongoose";

export class PetriNetUtils {
  static isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }

  static generateObjectId(): string {
    return new Types.ObjectId().toString();
  }

  static validateNetId(netId?: string): string {
    if (!netId || !this.isValidObjectId(netId)) {
      console.warn(`Invalid or missing netId: ${netId}. Generating a new ObjectId.`);
      return this.generateObjectId();
    }
    return netId;
  }

  static limitHistorySize<T>(history: T[], maxSize: number = 50): T[] {
    return history.length > maxSize ? history.slice(-maxSize) : history;
  }

  static convertMapToObject(map: Map<string, number>): Record<string, number> {
    return Object.fromEntries(map);
  }

  static convertObjectToMap(obj: Record<string, number>): Map<string, number> {
    return new Map(Object.entries(obj));
  }
}