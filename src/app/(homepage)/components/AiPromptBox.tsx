"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowUpIcon,
  LightbulbIcon,
  PaperclipIcon,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import ModelSelector, { type Model } from "./ModelSelector";

const DEFAULT_MODEL_ID = "inclusionai/ring-2.6-1t:free";
const MODEL_STORAGE_KEY = "prooompt_selected_model";

export default function AiPromptBox() {
  const [prompt, setPrompt] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedModel = window.localStorage.getItem(MODEL_STORAGE_KEY);
    if (storedModel) {
      setSelectedModelId(storedModel);
    }
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      setLoadingModels(true);

      try {
        const response = await fetch("/api/ai/get-models");
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.status}`);
        }

        const data = await response.json();
        setModels(Array.isArray(data.models) ? data.models : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingModels(false);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (selectedModelId) {
      window.localStorage.setItem(MODEL_STORAGE_KEY, selectedModelId);
    }
  }, [selectedModelId]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMenuOpen]);

  const selectedModel = useMemo(() => {
    return (
      models.find((model) => model.id === selectedModelId) ?? {
        id: DEFAULT_MODEL_ID,
        name: "Default AI model",
        description: "Select a model to see more details.",
        context_length: 0,
        architecture: {
          modality: "text->text",
          input_modalities: ["text"],
          output_modalities: ["text"],
          tokenizer: "Other",
          instruct_type: null,
        },
        pricing: {
          prompt: "0",
          completion: "0",
        },
        top_provider: {
          context_length: 0,
          max_completion_tokens: 0,
          is_moderated: false,
        },
      }
    );
  }, [models, selectedModelId]);

  const handleSelectModel = (modelId: string) => {
    setSelectedModelId(modelId);
    setIsMenuOpen(false);
  };

  return (
    <motion.div
      ref={containerRef}
      layout
      className="w-125 bg-secondary rounded-lg transition-colors overflow-hidden"
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {isMenuOpen ? (
          <motion.div
            key="model-selector"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <ModelSelector
              isOpen={isMenuOpen}
              models={models}
              selectedModelId={selectedModelId}
              onSelectModel={handleSelectModel}
              onBack={() => setIsMenuOpen(false)}
              loading={loadingModels}
            />
          </motion.div>
        ) : (
          <motion.div
            key="prompt-box"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="px-4.5 pb-3"
          >
            <Textarea
              placeholder="Ask anything"
              className="resize-none w-full py-4 min-h-[60px] border-none focus-visible:ring-0 shadow-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex justify-between">
              <div className="flex flex-1 items-center gap-3 text-muted-foreground">
                <PaperclipIcon
                  size={18}
                  weight="bold"
                  className="cursor-pointer hover:text-foreground transition-colors"
                />
                <LightbulbIcon
                  size={18}
                  weight="bold"
                  className="cursor-pointer hover:text-foreground transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Button
                  variant="ghost"
                  onClick={() => setIsMenuOpen(true)}
                  className="px-2 h-8 text-xs font-medium hover:bg-background/50 rounded-full transition-all active:scale-95"
                >
                  {loadingModels ? "Loading models..." : selectedModel.name}
                </Button>
                <Button
                  size="icon-sm"
                  disabled={prompt.trim() === ""}
                  className="disabled:hover:cursor-not-allowed rounded-full transition-all active:scale-95"
                >
                  <ArrowUpIcon size={16} weight="bold" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
