import { MealEntry } from "@/types/meal";

export function removeHistoricalPhotos(meals: MealEntry[], now = new Date()) {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return meals.map((meal) => {
    if (meal.imageDataUrl && new Date(meal.eatenAt) < todayStart) {
      return { ...meal, imageDataUrl: "" };
    }
    return meal;
  });
}
