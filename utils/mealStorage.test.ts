import { describe, expect, it } from "vitest";
import { removeHistoricalPhotos } from "./mealStorage";
import { MealEntry } from "@/types/meal";

const meal = (id: string, eatenAt: Date): MealEntry => ({ id, imageDataUrl: `data:image/jpeg;base64,${id}`, description: id, calories: 500, eatenAt: eatenAt.toISOString(), createdAt: eatenAt.toISOString() });

describe("removeHistoricalPhotos", () => {
  it("removes old photos while keeping meal details and today's photo", () => {
    const now = new Date(2026, 6, 21, 12);
    const yesterday = meal("yesterday", new Date(2026, 6, 20, 20));
    const today = meal("today", new Date(2026, 6, 21, 8));
    const result = removeHistoricalPhotos([yesterday, today], now);

    expect(result[0]).toMatchObject({ id: "yesterday", description: "yesterday", calories: 500, imageDataUrl: "" });
    expect(result[1].imageDataUrl).toContain("today");
  });
});
