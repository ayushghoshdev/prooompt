"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowUpIcon,
  LightbulbIcon,
  PaperclipIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

export default function AiPromptBox() {
  const [prompt, setPrompt] = useState("");

  // make the prompt box turn into the menu box when a option is selected
  return (
    <div className="bg-secondary rounded-lg px-4 pb-4 w-[500px]">
      <Textarea
        placeholder="Ask anything"
        className="resize-none w-full py-4"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="flex justify-between">
        <div className="flex items-center gap-3 text-muted-foreground">
          <PaperclipIcon
            size={18}
            weight="bold"
            className="cursor-pointer hover:text-foreground"
          />
          <LightbulbIcon
            size={18}
            weight="bold"
            className="cursor-pointer hover:text-foreground"
          />
        </div>
        <Button
          size="icon-sm"
          disabled={prompt.trim() === ""}
          className="disabled:hover:cursor-not-allowed"
        >
          <ArrowUpIcon size={16} weight="bold" />
        </Button>
      </div>
    </div>
  );
}
