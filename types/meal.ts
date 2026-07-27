export type MealEntry = {
  id: string;
  imageDataUrl: string;
  description: string;
  analysisBasis?: string[];
  notes?: string;
  calories: number;
  eatenAt: string;
  createdAt: string;
};
