import { MealEntry } from "@/types/meal";

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sameLocalDay(iso: string, date: Date) {
  const value = new Date(iso);
  return value.getFullYear() === date.getFullYear() && value.getMonth() === date.getMonth() && value.getDate() === date.getDate();
}

export function mealsForToday(meals: MealEntry[], now = new Date()) {
  return meals.filter((meal) => sameLocalDay(meal.eatenAt, now));
}

export function caloriesToday(meals: MealEntry[], now = new Date()) {
  return mealsForToday(meals, now).reduce((sum, meal) => sum + meal.calories, 0);
}

export function caloriesThisWeek(meals: MealEntry[], now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = start.getDay();
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return meals.reduce((sum, meal) => {
    const date = new Date(meal.eatenAt);
    return date >= start && date < end ? sum + meal.calories : sum;
  }, 0);
}

export function weeklyCalorieBalance(meals: MealEntry[], dailyTarget: number, now = new Date(), earnedByDate: Record<string, number> = {}) {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = now.getDay();
  const completedDays = day === 0 ? 6 : day - 1;
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - completedDays);

  const caloriesBeforeToday = meals.reduce((sum, meal) => {
    const eatenAt = new Date(meal.eatenAt);
    return eatenAt >= weekStart && eatenAt < todayStart ? sum + meal.calories : sum;
  }, 0);

  const caloriesTodayTotal = meals.reduce((sum, meal) => {
    const eatenAt = new Date(meal.eatenAt);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    return eatenAt >= todayStart && eatenAt < tomorrowStart ? sum + meal.calories : sum;
  }, 0);

  let earnedBeforeToday = 0;
  for (let offset = 0; offset < completedDays; offset += 1) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + offset);
    earnedBeforeToday += earnedByDate[localDateKey(date)] ?? 0;
  }

  const earnedToday = earnedByDate[localDateKey(now)] ?? 0;
  const todayOverage = Math.max(0, caloriesTodayTotal - dailyTarget);

  return dailyTarget * completedDays + earnedBeforeToday - caloriesBeforeToday + earnedToday - todayOverage;
}

export function lastWeekSummary(meals: MealEntry[], dailyTarget: number, now = new Date(), earnedByDate: Record<string, number> = {}, unloggedCalories = 0) {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentDay = now.getDay();
  const currentMonday = new Date(todayStart);
  currentMonday.setDate(currentMonday.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  const lastMonday = new Date(currentMonday);
  lastMonday.setDate(lastMonday.getDate() - 7);

  const recordedConsumed = meals.reduce((sum, meal) => {
    const eatenAt = new Date(meal.eatenAt);
    return eatenAt >= lastMonday && eatenAt < currentMonday ? sum + meal.calories : sum;
  }, 0);

  let earned = 0;
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(lastMonday);
    date.setDate(date.getDate() + offset);
    earned += earnedByDate[localDateKey(date)] ?? 0;
  }

  const allowance = dailyTarget * 7;
  const consumed = recordedConsumed + Math.max(0, unloggedCalories);
  return {
    start: lastMonday,
    end: new Date(currentMonday.getTime() - 1),
    consumed,
    recordedConsumed,
    unloggedCalories: Math.max(0, unloggedCalories),
    earned,
    allowance,
    balance: allowance + earned - consumed,
  };
}
