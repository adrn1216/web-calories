import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
  }

  try {
    const { imageDataUrl, notes = "" } = await request.json() as { imageDataUrl?: string; notes?: string };
    if (!imageDataUrl?.startsWith("data:image/")) {
      return NextResponse.json({ error: "A valid food image is required." }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      reasoning: { effort: "low" },
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: `Analyze this meal photo for calorie tracking. User notes: ${notes.trim() || "None"}. Identify only food/drinks reasonably visible or supported by the notes. Estimate portions and total calories. Be concise and transparent about uncertainty. Return JSON matching the schema.` },
          { type: "input_image", image_url: imageDataUrl, detail: "high" },
        ],
      }],
      text: {
        format: {
          type: "json_schema",
          name: "meal_analysis",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              description: { type: "string", description: "Concise description of all food and drinks observed." },
              basis: { type: "array", items: { type: "string" }, description: "Ingredient or portion assumptions with estimated calorie contribution." },
              estimatedCalories: { type: "integer", minimum: 1, description: "Best single total calorie estimate." },
            },
            required: ["description", "basis", "estimatedCalories"],
          },
        },
      },
    });

    if (!response.output_text) {
      return NextResponse.json({ error: "Walang analysis na naibalik. Subukan ang mas malinaw na photo." }, { status: 422 });
    }

    const result = JSON.parse(response.output_text) as { description: string; basis: string[]; estimatedCalories: number };
    return NextResponse.json(result);
  } catch (error) {
    console.error("Meal analysis failed", error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json({ error: "Invalid ang OpenAI API key. I-check ang OPENAI_API_KEY sa .env." }, { status: 401 });
      }
      if (error.status === 413) {
        return NextResponse.json({ error: "Masyadong malaki ang photo. Pumili ng mas maliit na image." }, { status: 413 });
      }
      if (error.status === 429) {
        return NextResponse.json({ error: "Naabot ang OpenAI quota o rate limit. I-check ang API billing at subukan ulit mamaya." }, { status: 429 });
      }
      if (error.status === 400) {
        return NextResponse.json({ error: "Hindi mabasa ng OpenAI ang image. Subukan itong i-upload ulit o gumamit ng ibang photo." }, { status: 400 });
      }
      if (error.status && error.status >= 500) {
        return NextResponse.json({ error: "Temporary unavailable ang OpenAI. Walang meal na na-save; subukan ulit mamaya." }, { status: 503 });
      }
    }

    return NextResponse.json({ error: "Hindi natapos ang image analysis. I-check ang connection at subukan ulit." }, { status: 500 });
  }
}
