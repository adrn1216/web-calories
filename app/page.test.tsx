import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./page";
import { MealEntry } from "@/types/meal";

const storedMeal: MealEntry = { id: "legacy-id", imageDataUrl: "data:image/jpeg;base64,x", description: "Test meal", analysisBasis: ["Rice — 200 cal"], calories: 500, eatenAt: new Date().toISOString(), createdAt: new Date().toISOString() };

describe("Home meal persistence", () => {
  beforeEach(() => localStorage.setItem("calorie-tracker-meals", JSON.stringify([storedMeal])));

  it("edits, saves, closes the drawer, and persists the update", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await screen.findByText("Test meal");
    await user.click(screen.getByRole("button", { name: /Edit/i }));
    const calories = screen.getByLabelText("Estimated calories");
    await user.clear(calories);
    await user.type(calories, "625");
    await user.click(screen.getByRole("button", { name: "Confirm & save" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: /Check the estimate/i })).not.toBeInTheDocument());
    expect(JSON.parse(localStorage.getItem("calorie-tracker-meals")!)[0].calories).toBe(625);
    expect(await screen.findByText("625 cal")).toBeInTheDocument();
  });

  it("shows yesterday's meal logs below today's meals", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const previousMeal: MealEntry = {
      ...storedMeal,
      id: "yesterday-id",
      description: "Yesterday meal",
      eatenAt: yesterday.toISOString(),
      createdAt: yesterday.toISOString(),
    };
    localStorage.setItem("calorie-tracker-meals", JSON.stringify([storedMeal, previousMeal]));

    render(<Home />);

    expect(await screen.findByText("Yesterday meal")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Yesterday" })).toBeInTheDocument();
  });

  it("updates settings and deletes a meal", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Home />);
    await screen.findByText("Test meal");
    await user.click(screen.getByRole("button", { name: "Open settings" }));
    const target = screen.getByLabelText(/Calories per day/i);
    await user.clear(target);
    await user.type(target, "1800");
    await user.click(screen.getByRole("button", { name: "Save target" }));
    await waitFor(() => expect(localStorage.getItem("calorie-tracker-target")).toBe("1800"));
    await user.click(screen.getByRole("button", { name: "Delete meal" }));
    await waitFor(() => expect(screen.getByText("No meals logged yet")).toBeInTheDocument());
  });

  it("adds earned exercise calories and closes the input sheet", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await screen.findByText("Test meal");
    await user.click(screen.getByRole("button", { name: "Add earned calories" }));
    await user.type(screen.getByLabelText("Calories burned"), "200");
    await user.click(screen.getByRole("button", { name: "Add calories" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Add earned calories" })).not.toBeInTheDocument());
    const saved = JSON.parse(localStorage.getItem("calorie-tracker-earned-calories")!);
    expect(Object.values(saved)).toContain(200);
    expect(screen.getAllByText("+200").length).toBeGreaterThan(0);
  });

  it("saves unlogged calories for last week", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await screen.findByText("Test meal");
    await user.click(screen.getByRole("button", { name: /Last Week Summary/i }));
    await user.type(screen.getByLabelText("Unlogged calories"), "300");
    await user.type(screen.getByLabelText(/^Weight/), "72.5");
    await user.click(screen.getByRole("button", { name: "Save summary" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Last Week Summary" })).not.toBeInTheDocument());
    const saved = JSON.parse(localStorage.getItem("calorie-tracker-week-adjustments")!);
    expect(Object.values(saved)).toContain(300);
    const weights = JSON.parse(localStorage.getItem("calorie-tracker-weekly-weight")!);
    expect(Object.values(weights)).toContain(72.5);
  });

  it("shows the saved weekly weight progression", async () => {
    const user = userEvent.setup();
    localStorage.setItem("calorie-tracker-weekly-weight", JSON.stringify({
      "2026-07-20": 73.2,
      "2026-07-27": 72.5,
      "2026-08-03": 71.9,
    }));
    render(<Home />);
    await screen.findByText("Test meal");
    await user.click(screen.getByRole("button", { name: /Last Week Summary/i }));

    expect(screen.getByRole("region", { name: "Overall weight trend" })).toBeInTheDocument();
    expect(screen.getByText("3 weekly check-ins")).toBeInTheDocument();
    expect(screen.getByText("-1.3 kg")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Weight changed from 73.2 to 71.9 kilograms" })).toBeInTheDocument();
  });
});
