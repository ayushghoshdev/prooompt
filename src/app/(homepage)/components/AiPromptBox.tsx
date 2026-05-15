"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  ArrowUpIcon,
  LightbulbIcon,
  PaperclipIcon,
  XIcon,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import ModelSelector, { type Model } from "./ModelSelector";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DEFAULT_MODEL_ID = "inclusionai/ring-2.6-1t:free";
const MODEL_STORAGE_KEY = "prooompt_selected_model";
const REASONING_STORAGE_KEY = "prooompt_reasoning_enabled";

export default function AiPromptBox() {
  const [prompt, setPrompt] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);
  const [isReasoningEnabled, setIsReasoningEnabled] = useState(false);
  const [isReasoningPopoverOpen, setIsReasoningPopoverOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState<
    string | null
  >(null);
  const [attachmentPreviewText, setAttachmentPreviewText] = useState<
    string | null
  >(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
  const MAX_DISPLAY_LENGTH = 30;
  const KEEP_END = 6;

  const formatFileName = (name: string) => {
    if (!name) return "";
    if (name.length <= MAX_DISPLAY_LENGTH) return name;
    const startLen = Math.max(1, MAX_DISPLAY_LENGTH - KEEP_END - 3);
    return `${name.slice(0, startLen)}...${name.slice(-KEEP_END)}`;
  };

  useEffect(() => {
    const storedModel = window.localStorage.getItem(MODEL_STORAGE_KEY);
    if (storedModel) {
      setSelectedModelId(storedModel);
    }

    const storedReasoning = window.localStorage.getItem(REASONING_STORAGE_KEY);
    if (storedReasoning) {
      setIsReasoningEnabled(storedReasoning === "true");
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
    window.localStorage.setItem(
      REASONING_STORAGE_KEY,
      String(isReasoningEnabled),
    );
  }, [isReasoningEnabled]);

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

  useEffect(() => {
    return () => {
      if (attachmentPreviewUrl) {
        URL.revokeObjectURL(attachmentPreviewUrl);
      }
    };
  }, [attachmentPreviewUrl]);

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
            {attachmentFile ? (
              <div className="mt-3 mb-3 p-3 bg-popover rounded-lg relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setAttachmentFile(null);
                        setAttachmentPreviewUrl(null);
                        setAttachmentPreviewText(null);

                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 h-7 w-7 p-0"
                    >
                      <XIcon size={32} weight="bold" className="ml-0.5" />
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent align="center">
                    <p>Remove attachment</p>
                  </TooltipContent>
                </Tooltip>
                <div className="flex items-start gap-3">
                  {attachmentPreviewUrl ? (
                    <img
                      src={attachmentPreviewUrl}
                      alt={attachmentFile.name}
                      className="h-16 w-16 object-cover rounded"
                    />
                  ) : (
                    <div
                      className="h-16 w-16 flex items-center justify-center rounded bg-muted-foreground/5 text-sm text-muted-foreground"
                      title={attachmentFile.name}
                    >
                      {formatFileName(attachmentFile.name)}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <div>
                        <div
                          className="font-medium"
                          title={attachmentFile.name}
                        >
                          {formatFileName(attachmentFile.name)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(attachmentFile.size / 1024)} KB
                        </div>
                      </div>
                    </div>

                    {attachmentPreviewText ? (
                      <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">
                        {attachmentPreviewText}
                      </pre>
                    ) : (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {!attachmentPreviewUrl
                          ? "Preview not available for this file type."
                          : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
            <Textarea
              placeholder="Ask anything"
              className="resize-none w-full py-4 min-h-[60px] border-none focus-visible:ring-0 shadow-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex justify-between">
              <div className="flex flex-1 items-center gap-3 text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <PaperclipIcon
                        size={18}
                        weight="bold"
                        className="cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => {
                          fileInputRef.current?.click();
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add attachment</p>
                  </TooltipContent>
                </Tooltip>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,.png,.jpg,.jpeg,.txt,.py,.java,.c,.pdf,.docx"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;

                    if (files.length > 1) {
                      e.currentTarget.value = "";
                      toast("Please attach only one file.");
                      return;
                    }

                    const file = files[0];
                    if (file.size > MAX_FILE_SIZE) {
                      e.currentTarget.value = "";
                      toast("File size exceeds 50 MB limit.");
                      return;
                    }
                    const name = file.name.toLowerCase();
                    const type = file.type;

                    const allowedExt = [
                      ".png",
                      ".jpg",
                      ".jpeg",
                      ".txt",
                      ".py",
                      ".java",
                      ".c",
                      ".cpp",
                      ".pdf",
                      ".docx",
                    ];

                    const isImage =
                      (type &&
                        (type === "image/png" || type === "image/jpeg")) ||
                      /\.(png|jpe?g)$/.test(name);
                    const isGif = type === "image/gif" || /\.gif$/.test(name);
                    const hasAllowedExt = allowedExt.some((ext) =>
                      name.endsWith(ext),
                    );

                    if (isGif) {
                      e.currentTarget.value = "";
                      toast("GIF images are not allowed.");
                      return;
                    }

                    if (!isImage && !hasAllowedExt) {
                      e.currentTarget.value = "";
                      toast(
                        "Unsupported file type. Allowed: jpeg, png, txt, docx, pdf, py, java, c.",
                      );
                      return;
                    }

                    // Accept file
                    setAttachmentFile(file);
                    setAttachmentPreviewText(null);
                    if (isImage) {
                      const url = URL.createObjectURL(file);
                      setAttachmentPreviewUrl(url);
                    } else if (/\.(txt|py|java|c)$/.test(name)) {
                      try {
                        const text = await file.text();
                        const snippet = text
                          .split(/\r?\n/)
                          .slice(0, 8)
                          .join("\n");
                        setAttachmentPreviewText(snippet);
                        setAttachmentPreviewUrl(null);
                      } catch (err) {
                        setAttachmentPreviewText(null);
                      }
                    } else {
                      // pdf/docx or other allowed binary types: just show filename
                      setAttachmentPreviewUrl(null);
                    }
                  }}
                />

                <Tooltip>
                  <Popover
                    open={isReasoningPopoverOpen}
                    onOpenChange={setIsReasoningPopoverOpen}
                  >
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <LightbulbIcon
                          size={18}
                          weight="bold"
                          className={`cursor-pointer 
                            ${
                              isReasoningEnabled
                                ? "text-primary/80 hover:text-primary"
                                : "hover:text-foreground"
                            } transition-colors`}
                        />
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reasoning</p>
                    </TooltipContent>
                    <PopoverContent className="w-69">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="leading-none font-medium">
                            Reasoning
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            When enabled, models will generate a step-by-step
                            breakdown of their logic before providing a final
                            answer. This may increase response times.
                          </p>
                          <Button
                            className="w-full"
                            onClick={() => {
                              setIsReasoningEnabled(!isReasoningEnabled);
                              setIsReasoningPopoverOpen(false);
                            }}
                          >
                            {isReasoningEnabled
                              ? "Disable reasoning"
                              : "Enable reasoning"}
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </Tooltip>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => setIsMenuOpen(true)}
                      className="px-2 h-8 text-xs font-medium hover:bg-background/50 rounded-full transition-all active:scale-95"
                    >
                      {loadingModels ? (
                        <span className="flex items-center gap-2">
                          Loading models
                          <Spinner className="h-3.5 w-3.5 text-current" />
                        </span>
                      ) : (
                        selectedModel.name
                      )}
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>Select model</p>
                  </TooltipContent>
                </Tooltip>

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
