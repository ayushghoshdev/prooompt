import { NextResponse } from "next/server";

interface ModelPricing {
  prompt?: string;
  completion?: string;
}

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  architecture?: string;
  pricing?: ModelPricing;
  top_provider?: string;
}

interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

export async function GET(req: Request) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Openrouter API Error: ${response.status}`);
    }

    const data: OpenRouterModelsResponse = await response.json();

    const freeModels: OpenRouterModel[] = data.data.filter(
      (model: OpenRouterModel) => {
        const promptPrice = parseFloat(model.pricing?.prompt || "0");
        const completetionPrice = parseFloat(model.pricing?.completion || "0");
        return promptPrice == 0 && completetionPrice == 0;
      },
    );

    const formattedModels = freeModels.map((model: OpenRouterModel) => ({
      id: model.id,
      name: model.name,
      description: model.description,
      context_length: model.context_length,
      architecture: model.architecture,
      pricing: model.pricing,
      top_provider: model.top_provider,
    }));

    return NextResponse.json({ models: formattedModels });
  } catch (error) {
    console.error("Error fetching models: ", error);

    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        success: false,
        error: message || "Failed to fetch models",
      },
      { status: 500 },
    );
  }
}
