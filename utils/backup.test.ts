import { describe, expect, it } from "vitest";
import { parseBackup } from "./backup";

const validBackup = {
  version: 1,
  exportedAt: "2026-07-27T10:00:00.000Z",
  dailyTarget: 2000,
  meals: [{
    id: "meal-1",
    imageDataUrl: "",
    description: "Rice",
    calories: 200,
    eatenAt: "2026-07-27T08:00:00.000Z",
    createdAt: "2026-07-27T08:00:00.000Z",
  }],
  earnedByDate: { "2026-07-27": 100 },
  weekAdjustments: {},
  weeklyWeights: { "2026-07-20": 72.5 },
};

describe("parseBackup", () => {
  it("accepts a valid versioned backup", () => {
    expect(parseBackup(JSON.stringify(validBackup))).toMatchObject({ dailyTarget: 2000, weeklyWeights: { "2026-07-20": 72.5 } });
  });

  it("rejects malformed and unsupported backups", () => {
    expect(() => parseBackup("not json")).toThrow("Hindi valid JSON");
    expect(() => parseBackup(JSON.stringify({ ...validBackup, version: 2 }))).toThrow("Hindi supported");
  });
});
