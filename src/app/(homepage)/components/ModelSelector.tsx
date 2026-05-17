"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

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
  models: Model[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  onBack?: () => void;
  loading: boolean;
}

export default function ModelSelector({
  models,
  selectedModelId,
  onSelectModel,
  loading,
}: ModelSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return models;

    const query = searchQuery.toLowerCase();
    return models.filter((model) => {
      const name = model.name.toLowerCase();
      const description = (model.description || "").toLowerCase();
      const id = model.id.toLowerCase();

      const arch = model.architecture;
      const architectureMatch =
        (arch.modality?.toLowerCase().includes(query) ?? false) ||
        (arch.tokenizer?.toLowerCase().includes(query) ?? false) ||
        (arch.instruct_type?.toLowerCase().includes(query) ?? false);

      return (
        name.includes(query) ||
        description.includes(query) ||
        id.includes(query) ||
        architectureMatch
      );
    });
  }, [models, searchQuery]);

  return (
    <div className="h-70 flex flex-col">
      <div className="overflow-y-auto px-3 py-2 flex-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
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
            <div className="flex items-center bg-input rounded-lg px-2 sticky top-0 z-10">
              <MagnifyingGlassIcon size={16} weight="bold" />
              <Input
                placeholder="Search models"
                className="bg-transparent! border-none focus-visible:ring-0 shadow-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {filteredModels.length === 0 ? (
              <div className="rounded-lg bg-muted px-4 py-6 text-sm text-muted-foreground text-center">
                No models found matching "{searchQuery}"
              </div>
            ) : (
              filteredModels.map((model) => {
                const isSelected = model.id === selectedModelId;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => onSelectModel(model.id)}
                    className={`cursor-pointer block w-full rounded-lg px-3 py-2 text-left transition duration-150 ${
                      isSelected ? "bg-muted" : "bg-transparent hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {model.name}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">
                      {model.description}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
