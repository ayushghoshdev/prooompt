"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@phosphor-icons/react";

export interface Model {
  id: string;
  name: string;
  description: string;
  context_length: number;
  architecture: {
    modality: string;
    input_modalities: string[];
    output_modalities: string[];
    tokenizer: string;
    instruct_type: string | null;
  };
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens: number;
    is_moderated: boolean;
  };
}

interface ModelSelectorProps {
  isOpen: boolean;
  models: Model[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  onBack: () => void;
  loading: boolean;
}

export default function ModelSelector({
  isOpen,
  models,
  selectedModelId,
  onSelectModel,
  onBack,
  loading,
}: ModelSelectorProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="h-115 overflow-hidden rounded-lg bg-secondary">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="mt-0.5"
            >
              <ArrowLeftIcon size={32} weight="bold" />
            </Button>
            <p>Select model</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {loading
                ? "Fetching available models..."
                : `${models.length} model${models.length === 1 ? "" : "s"} available`}
            </p>
          </div>
        </div>
        <div className="overflow-y-auto px-3 py-2">
          {loading ? (
            <div className="rounded-lg bg-muted px-4 py-6 text-sm text-muted-foreground">
              Loading models...
            </div>
          ) : models.length === 0 ? (
            <div className="rounded-lg bg-muted px-4 py-6 text-sm text-muted-foreground">
              No models available right now.
            </div>
          ) : (
            <div className="space-y-2">
              {models.map((model) => {
                const isSelected = model.id === selectedModelId;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => onSelectModel(model.id)}
                    className={`block w-full rounded-2xl px-4 py-4 text-left transition duration-150 ${
                      isSelected
                        ? "bg-primary/10"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {model.name}
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-1 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                        {model.architecture.modality}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {model.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      <span className="rounded-full bg-muted px-2 py-1">
                        context {model.context_length}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-1">
                        max completion{" "}
                        {model.top_provider?.max_completion_tokens ?? "-"}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-1">
                        prompt ${model.pricing.prompt}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-1">
                        completion ${model.pricing.completion}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
