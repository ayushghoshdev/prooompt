import { NextResponse } from "next/server";

interface ModelPricing {
  prompt?: string;
  completion?: string;
}

interface ModelArchitecture {
  modality?: string;
  input_modalities?: string[];
  output_modalities?: string[];
  tokenizer?: string;
  instruct_type?: string | null;
}

interface TopProvider {
  context_length: number;
  max_completion_tokens?: number;
  is_moderated: boolean;
}

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  architecture?: ModelArchitecture;
  pricing?: ModelPricing;
  top_provider?: TopProvider;
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

    const filteredModels: OpenRouterModel[] = data.data.filter(
      (model: OpenRouterModel) => {
        // Filter for free models
        const promptPrice = parseFloat(model.pricing?.prompt || "0");
        const completionPrice = parseFloat(model.pricing?.completion || "0");
        const isFree = promptPrice === 0 && completionPrice === 0;

        // Filter for text-only output models
        const outputModalities = model.architecture?.output_modalities;
        const isTextOnlyOutput =
          Array.isArray(outputModalities) &&
          outputModalities.length === 1 &&
          outputModalities[0] === "text";

        return isFree && isTextOnlyOutput;
      },
    );

    const formattedModels = filteredModels.map((model: OpenRouterModel) => ({
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
