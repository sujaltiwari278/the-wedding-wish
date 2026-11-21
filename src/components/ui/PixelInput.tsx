"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface PixelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const PixelInput = React.forwardRef<HTMLInputElement, PixelInputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-pixel text-[11px] text-deep uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full bg-cream border-2 border-deep px-3 py-2 text-deep font-retro text-lg outline-none transition-all duration-75 placeholder:text-deep/40 focus:border-vintage focus:shadow-[2px_2px_0px_#9C5968] disabled:opacity-50 disabled:bg-soft-blush",
            error && "border-[#B44C43] focus:border-[#B44C43] focus:shadow-[2px_2px_0px_#B44C43]",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="font-retro text-sm text-deep/70">{hint}</p>
        )}
        {error && (
          <p className="font-pixel text-[10px] text-[#B44C43] tracking-wide">
            ⚠ {error}
          </p>
        )}
      </div>
    );
  }
);

PixelInput.displayName = "PixelInput";

export interface PixelTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const PixelTextarea = React.forwardRef<
  HTMLTextAreaElement,
  PixelTextareaProps
>(({ label, error, hint, className, id, rows = 4, ...props }, ref) => {
  const generatedId = React.useId();
  const textareaId = id || generatedId;

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={textareaId}
          className="block font-pixel text-[11px] text-deep uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        ref={ref}
        rows={rows}
        className={cn(
          "w-full bg-cream border-2 border-deep px-3 py-2 text-deep font-retro text-lg outline-none transition-all duration-75 placeholder:text-deep/40 focus:border-vintage focus:shadow-[2px_2px_0px_#9C5968] disabled:opacity-50 disabled:bg-soft-blush",
          error && "border-[#B44C43] focus:border-[#B44C43] focus:shadow-[2px_2px_0px_#B44C43]",
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p className="font-retro text-sm text-deep/70">{hint}</p>
      )}
      {error && (
        <p className="font-pixel text-[10px] text-[#B44C43] tracking-wide">
          ⚠ {error}
        </p>
      )}
    </div>
  );
});

PixelTextarea.displayName = "PixelTextarea";

export interface PixelSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export const PixelSelect = React.forwardRef<
  HTMLSelectElement,
  PixelSelectProps
>(({ label, error, hint, options, className, id, ...props }, ref) => {
  const generatedId = React.useId();
  const selectId = id || generatedId;

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="block font-pixel text-[11px] text-deep uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full appearance-none bg-cream border-2 border-deep px-3 py-2 pr-8 text-deep font-retro text-lg outline-none transition-all duration-75 focus:border-vintage focus:shadow-[2px_2px_0px_#9C5968] disabled:opacity-50",
            error && "border-[#B44C43]",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-cream text-deep">
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-pixel text-[10px] text-deep">
          ▼
        </span>
      </div>
      {hint && !error && (
        <p className="font-retro text-sm text-deep/70">{hint}</p>
      )}
      {error && (
        <p className="font-pixel text-[10px] text-[#B44C43] tracking-wide">
          ⚠ {error}
        </p>
      )}
    </div>
  );
});

PixelSelect.displayName = "PixelSelect";
