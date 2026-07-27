import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MealFormSheet } from "./MealFormSheet";

describe("MealFormSheet", () => {
  it("analyzes, shows the estimate, and confirms without a real API call", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ description: "Rice and chicken", basis: ["1 cup rice — 200 cal", "Chicken — 350 cal"], estimatedCalories: 550 }), { status: 200, headers: { "Content-Type": "application/json" } })));
    render(<MealFormSheet open initial={{ imageDataUrl: "data:image/jpeg;base64,x", notes: "", description: "", basis: [], calories: "" }} editing={false} onClose={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByLabelText(/Notes/i), "one cup rice");
    await user.click(screen.getByRole("button", { name: "Analyze meal" }));
    expect(await screen.findByText("Image Analysis")).toBeInTheDocument();
    expect(screen.getByDisplayValue("550")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirm & save" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ calories: 550, description: "Rice and chicken" })));
  });
});
