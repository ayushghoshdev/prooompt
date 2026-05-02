"use client";

import { PlusIcon } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";

export default function Sidebar() {
  const [width, setWidth] = useState(300);
  const [isDragging, setIsDragging] = useState(false);
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
        style={{ width: `${width}px` }}
        className="h-screen text-white p-4 relative"
      >
        <Link href="/">
          <Image
            src="/icon.png"
            width={30}
            height={30}
            alt="Icon"
            className="transition-transform duration-1000 ease-in-out hover:rotate-360"
          />
        </Link>
        <div className="flex items-center justify-between w-full bg-secondary text-muted-foreground rounded-lg mt-4 px-4 py-2">
          <p className="font-medium">Chats</p>

          <Link href="/">
            <PlusIcon
              size={16}
              weight="bold"
              className="hover:text-foreground"
            />
          </Link>
        </div>
        <div
          onMouseDown={onMouseDown}
          className="absolute top-0 right-0 h-full border-r-3 border-dashed border-muted cursor-col-resize hover:border-secondary-foreground"
        />
      </div>
    </>
  );
}
