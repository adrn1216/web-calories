import { CalorieBackup } from "@/types/backup";
import { MealEntry } from "@/types/meal";

function isNumberRecord(value: unknown): value is Record<string, number> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    && Object.values(value).every((item) => typeof item === "number" && Number.isFinite(item) && item >= 0);
}

function isMeal(value: unknown): value is MealEntry {
  if (typeof value !== "object" || value === null) return false;
  const meal = value as Partial<MealEntry>;
  return typeof meal.id === "string"
    && typeof meal.imageDataUrl === "string"
    && typeof meal.description === "string"
    && typeof meal.calories === "number"
    && Number.isFinite(meal.calories)
    && meal.calories > 0
    && typeof meal.eatenAt === "string"
    && !Number.isNaN(Date.parse(meal.eatenAt))
    && typeof meal.createdAt === "string"
    && !Number.isNaN(Date.parse(meal.createdAt));
}

export function parseBackup(text: string): CalorieBackup {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("Hindi valid JSON file.");
  }

  if (typeof value !== "object" || value === null) throw new Error("Hindi valid calorie backup.");
  const backup = value as Partial<CalorieBackup>;
  if (backup.version !== 1) throw new Error("Hindi supported ang backup version.");
  if (typeof backup.dailyTarget !== "number" || !Number.isFinite(backup.dailyTarget) || backup.dailyTarget <= 0) throw new Error("Invalid ang daily target sa backup.");
  if (!Array.isArray(backup.meals) || !backup.meals.every(isMeal)) throw new Error("Invalid ang meal data sa backup.");
  if (!isNumberRecord(backup.earnedByDate) || !isNumberRecord(backup.weekAdjustments) || !isNumberRecord(backup.weeklyWeights)) throw new Error("Invalid ang weekly data sa backup.");
  if (typeof backup.exportedAt !== "string" || Number.isNaN(Date.parse(backup.exportedAt))) throw new Error("Invalid ang export date sa backup.");
  return backup as CalorieBackup;
}
