"use client";

import {
  CaretRightIcon,
  PlusIcon,
  SidebarSimpleIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "./ui/button";

export default function Sidebar() {
  const [width, setWidth] = useState(300);
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatsCollapsed, setIsChatsCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const onMouseDown = () => {
    setIsDragging(true);
  };

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newWidth = e.clientX;
        if (newWidth > 250 && newWidth < 500) {
          setWidth(newWidth);
        }
      }
    },
    [isDragging],
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    } else {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, onMouseMove, onMouseUp]);

  return (
    <>
      <div
        ref={sidebarRef}
        style={!isSidebarCollapsed ? { width: `${width}px` } : {}}
        className={
          isSidebarCollapsed
            ? "fixed top-4 left-4 z-50 flex items-center gap-4 text-white"
            : "h-screen text-white p-4 relative"
        }
      >
        <div
          className={
            isSidebarCollapsed
              ? "flex items-center gap-2"
              : "flex items-center justify-between"
          }
        >
          <Link href="/">
            <Image
              src="/icon.png"
              width={30}
              height={30}
              loading="eager"
              alt="Icon"
              className="transition-transform duration-1000 ease-in-out hover:rotate-360"
            />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            <SidebarSimpleIcon weight="bold" className="size-5" />
          </Button>
        </div>
        {!isSidebarCollapsed && (
          <>
            <div className="w-full bg-secondary text-muted-foreground rounded-lg mt-4 px-4 py-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">Chats</p>

                <div className="flex gap-2">
                  <Link href="/">
                    <PlusIcon
                      size={16}
                      weight="bold"
                      className="hover:text-foreground"
                    />
                  </Link>
                  <CaretRightIcon
                    size={16}
                    weight="bold"
                    onClick={() => setIsChatsCollapsed(!isChatsCollapsed)}
                    className={`cursor-pointer hover:text-foreground -mr-1 transition-transform duration-300 ${isChatsCollapsed ? "rotate-90" : "rotate-0"}`}
                  />
                </div>
              </div>

              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                  isChatsCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
                }`}
              >
                <div
                  className={`overflow-hidden transition-opacity duration-300 ${isChatsCollapsed ? "opacity-0" : "opacity-100"}`}
                >
                  <p className="mt-2 text-muted-foreground/60">No Chats yet.</p>
                </div>
              </div>
            </div>
            <div
              onMouseDown={onMouseDown}
              className="absolute top-0 right-0 h-full border-r-3 border-dashed border-muted cursor-col-resize hover:border-secondary-foreground"
            />
          </>
        )}
      </div>
    </>
  );
}
