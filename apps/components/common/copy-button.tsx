"use client";

import { CheckIcon, CircleXIcon, CopyIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import {
  CopyState,
  useCopyToClipboard,
} from "@/hooks/use-copy-to-clipboard.ts";

export function CopyStateIcon({ state }: { state: CopyState }) {
  return state === "idle" ? (
    <span key="idle">
      <CopyIcon
        size={16}
        className={cn(
          "transition-all",
          "scale-100 opacity-100",
          "stroke-muted-foreground group-hover/icon:stroke-primary",
        )}
      />
    </span>
  ) : state === "done" ? (
    <span key="done">
      <CheckIcon
        size={16}
        className={cn(
          "stroke-primary group-hover:text-primary transition-all",
          "scale-100 opacity-100",
          "stroke-green-500",
        )}
      />
    </span>
  ) : state === "error" ? (
    <span key="error">
      <CircleXIcon
        size={16}
        className={cn(
          "stroke-current text-red-500 transition-all",
          "scale-100 opacity-100",
        )}
      />
    </span>
  ) : null;
}

export type CopyButtonProps = ComponentProps<"button"> & {
  text: string | (() => string);
  onCopySuccess?: (text: string) => void;
  onCopyError?: (error: Error) => void;
  children?: React.ReactNode;
};

export function CopyButton({
  children,
  text,
  onCopySuccess,
  onCopyError,
  onClick,
  className,
  ...props
}: CopyButtonProps) {
  const { state, copy } = useCopyToClipboard({
    onCopySuccess,
    onCopyError,
  });

  return (
    <button
      onClick={(e) => {
        copy(text);
        onClick?.(e);
      }}
      disabled={state === "done"}
      className={cn(
        "group/icon hover:bg-muted focus-visible:ring-ring/50 text-muted-foreground hover:text-primary absolute right-0 flex cursor-pointer items-center justify-center rounded-md p-2 transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed",
        "duration-100 ease-in-out",
    
        className,
      )}
      aria-label="Copy"
      {...props}
    >
      <CopyStateIcon state={state} />
      {children}
    </button>
  );
}
