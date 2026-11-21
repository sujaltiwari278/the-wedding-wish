import React from "react";
import { cn } from "@/lib/utils";

export interface PixelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "cream" | "blush" | "outline" | "elevated";
  shadow?: "sm" | "md" | "lg" | "none";
}

export function PixelCard({
  children,
  className,
  variant = "default",
  shadow = "md",
  ...props
}: PixelCardProps) {
  const variantStyles = {
    default: "bg-soft-blush border-deep",
    cream: "bg-cream border-deep",
    blush: "bg-blush border-deep",
    outline: "bg-transparent border-deep",
    elevated: "bg-cream border-deep",
  };

  const shadowStyles = {
    none: "",
    sm: "shadow-pixel-sm",
    md: "shadow-pixel",
    lg: "shadow-pixel-lg",
  };

  const resolvedShadow = variant === "elevated" && shadow === "md" ? "lg" : shadow;

  return (
    <div
      className={cn(
        "border-pixel p-5 text-deep relative",
        variantStyles[variant],
        shadowStyles[resolvedShadow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PixelCardHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-b-2 border-deep/20 pb-3 mb-4 font-pixel text-sm uppercase flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PixelCardContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {children}
    </div>
  );
}

export function PixelCardFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-t-2 border-deep/20 pt-3 mt-4 flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
