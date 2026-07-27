import { MealEntry } from "./meal";

export type CalorieBackup = {
  version: 1;
  exportedAt: string;
  dailyTarget: number;
  meals: MealEntry[];
  earnedByDate: Record<string, number>;
  weekAdjustments: Record<string, number>;
  weeklyWeights: Record<string, number>;
};
