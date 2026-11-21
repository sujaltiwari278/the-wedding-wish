"use client";

import React, { useState, useEffect } from "react";
import { Sprite } from "./Sprite";

export interface SpriteFrameConfig {
  src: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps: number;
  loop?: boolean;
  nextState?: string;
}

export interface SpriteSequenceProps {
  states: Record<string, SpriteFrameConfig>;
  initialState: string;
  activeState?: string;
  scale?: number;
  className?: string;
  alt?: string;
  onStateChange?: (state: string) => void;
}

export function SpriteSequence({
  states,
  initialState,
  activeState,
  scale = 1,
  className,
  alt,
  onStateChange,
}: SpriteSequenceProps) {
  const [currentState, setCurrentState] = useState(activeState || initialState);

  useEffect(() => {
    if (activeState && states[activeState]) {
      setCurrentState(activeState);
    }
  }, [activeState, states]);

  const activeConfig = states[currentState] || states[initialState];
  if (!activeConfig) return null;

  const handleAnimationEnd = () => {
    if (activeConfig.nextState && states[activeConfig.nextState]) {
      const next = activeConfig.nextState;
      setCurrentState(next);
      onStateChange?.(next);
    }
  };

  return (
    <Sprite
      src={activeConfig.src}
      frameWidth={activeConfig.frameWidth}
      frameHeight={activeConfig.frameHeight}
      frameCount={activeConfig.frameCount}
      fps={activeConfig.fps}
      loop={activeConfig.loop ?? true}
      scale={scale}
      className={className}
      alt={alt || `Character State: ${currentState}`}
      onAnimationEnd={handleAnimationEnd}
    />
  );
}
