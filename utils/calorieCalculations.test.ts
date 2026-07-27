import { describe, expect, it } from "vitest";
import { lastWeekSummary, weeklyCalorieBalance } from "./calorieCalculations";
import { MealEntry } from "@/types/meal";

const meal = (calories: number, eatenAt: string): MealEntry => ({ id: eatenAt, imageDataUrl: "data:image/jpeg;base64,x", description: "Meal", calories, eatenAt, createdAt: eatenAt });

describe("weeklyCalorieBalance", () => {
  it("uses Monday as day one and returns saved calories", () => {
    const now = new Date(2026, 6, 22, 12); // Wednesday, local time
    const meals = [meal(1800, new Date(2026, 6, 20, 12).toISOString()), meal(1900, new Date(2026, 6, 21, 12).toISOString())];
    expect(weeklyCalorieBalance(meals, 2000, now)).toBe(300);
  });

  it("returns a negative balance after overspending on a completed day", () => {
    const now = new Date(2026, 6, 21, 12); // Tuesday
    const monday = new Date(2026, 6, 20, 20);
    expect(weeklyCalorieBalance([meal(2150, monday.toISOString())], 2000, now)).toBe(-150);
  });

  it("does not add today's unused calories before the day is complete", () => {
    const now = new Date(2026, 6, 21, 12); // Tuesday
    const monday = meal(1800, new Date(2026, 6, 20, 20).toISOString());
    const today = meal(1500, now.toISOString());
    expect(weeklyCalorieBalance([monday, today], 2000, now)).toBe(200);
  });

  it("charges only today's excess against the completed-day balance", () => {
    const now = new Date(2026, 6, 21, 12); // Tuesday
    const monday = meal(1800, new Date(2026, 6, 20, 20).toISOString());
    const today = meal(2150, now.toISOString());
    expect(weeklyCalorieBalance([monday, today], 2000, now)).toBe(50);
  });

  it("adds exercise calories directly while still charging today's overage", () => {
    const now = new Date(2026, 6, 21, 12); // Tuesday
    const monday = meal(2000, new Date(2026, 6, 20, 20).toISOString());
    const today = meal(2150, now.toISOString());
    expect(weeklyCalorieBalance([monday, today], 2000, now, { "2026-07-21": 200 })).toBe(50);
  });
});

describe("lastWeekSummary", () => {
  it("summarizes the previous Monday through Sunday", () => {
    const now = new Date(2026, 6, 27, 12); // Monday
    const mealLastWeek = meal(1200, new Date(2026, 6, 20, 12).toISOString());
    const mealToday = meal(900, now.toISOString());
    const summary = lastWeekSummary([mealLastWeek, mealToday], 2000, now, { "2026-07-20": 200 });
    expect(summary).toMatchObject({ allowance: 14000, consumed: 1200, earned: 200, balance: 13000 });
  });

  it("adds unlogged calories to consumed and reduces the final balance", () => {
    const now = new Date(2026, 6, 27, 12);
    const recorded = meal(1200, new Date(2026, 6, 20, 12).toISOString());
    const summary = lastWeekSummary([recorded], 2000, now, {}, 300);
    expect(summary).toMatchObject({ recordedConsumed: 1200, unloggedCalories: 300, consumed: 1500, balance: 12500 });
  });
});
