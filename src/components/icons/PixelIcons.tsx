import React from "react";

export type PixelIconType =
  | "plane"
  | "house"
  | "kitchen"
  | "sofa"
  | "ring"
  | "heart"
  | "gift"
  | "camera"
  | "car";

interface PixelIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function PixelIcon({ name, className = "", size = 32 }: PixelIconProps) {
  const iconMap: Record<string, React.ReactNode> = {
    plane: (
      // Retro Pixel Plane
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        className={`pixel-art ${className}`}
      >
        <rect x="7" y="1" width="2" height="14" />
        <rect x="5" y="4" width="6" height="2" />
        <rect x="2" y="6" width="12" height="2" />
        <rect x="4" y="8" width="8" height="2" />
        <rect x="6" y="10" width="4" height="2" />
        <rect x="4" y="13" width="8" height="2" />
      </svg>
    ),
    house: (
      // Retro Pixel House
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        className={`pixel-art ${className}`}
      >
        <rect x="7" y="1" width="2" height="2" />
        <rect x="5" y="3" width="6" height="2" />
        <rect x="3" y="5" width="10" height="2" />
        <rect x="1" y="7" width="14" height="2" />
        <rect x="2" y="9" width="12" height="6" />
        <rect x="6" y="11" width="4" height="4" fill="#FFF7F2" />
        <rect x="11" y="3" width="2" height="3" />
      </svg>
    ),
    kitchen: (
      // Retro Pixel Chef Hat / Pan / Kitchen
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        className={`pixel-art ${className}`}
      >
        <rect x="4" y="2" width="8" height="2" />
        <rect x="2" y="4" width="12" height="3" />
        <rect x="3" y="7" width="10" height="4" />
        <rect x="4" y="11" width="8" height="2" />
        <rect x="5" y="13" width="6" height="2" />
      </svg>
    ),
    sofa: (
      // Retro Pixel Sofa
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        className={`pixel-art ${className}`}
      >
        <rect x="3" y="4" width="10" height="6" />
        <rect x="1" y="6" width="3" height="7" />
        <rect x="12" y="6" width="3" height="7" />
        <rect x="3" y="10" width="10" height="3" />
        <rect x="3" y="13" width="2" height="2" />
        <rect x="11" y="13" width="2" height="2" />
      </svg>
    ),
    ring: (
      // Retro Pixel Diamond Ring
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        className={`pixel-art ${className}`}
      >
        <rect x="7" y="1" width="2" height="2" />
        <rect x="6" y="3" width="4" height="2" />
        <rect x="4" y="5" width="8" height="2" />
        <rect x="3" y="7" width="2" height="6" />
        <rect x="11" y="7" width="2" height="6" />
        <rect x="5" y="13" width="6" height="2" />
      </svg>
    ),
    heart: (
      // Retro Pixel Heart
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        className={`pixel-art ${className}`}
      >
        <rect x="3" y="2" width="4" height="2" />
        <rect x="9" y="2" width="4" height="2" />
        <rect x="2" y="4" width="12" height="3" />
        <rect x="3" y="7" width="10" height="2" />
        <rect x="4" y="9" width="8" height="2" />
        <rect x="5" y="11" width="6" height="2" />
        <rect x="7" y="13" width="2" height="2" />
      </svg>
    ),
    gift: (
      // Retro Pixel Shagun Gift Box
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        className={`pixel-art ${className}`}
      >
        <rect x="4" y="2" width="8" height="2" />
        <rect x="2" y="4" width="12" height="3" />
        <rect x="3" y="7" width="10" height="8" />
        <rect x="7" y="4" width="2" height="11" fill="#FFF7F2" />
        <rect x="2" y="5" width="12" height="1" fill="#FFF7F2" />
      </svg>
    ),
    camera: (
      // Retro Pixel Camera
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        className={`pixel-art ${className}`}
      >
        <rect x="5" y="3" width="6" height="2" />
        <rect x="2" y="5" width="12" height="8" />
        <rect x="6" y="7" width="4" height="4" fill="#FFF7F2" />
      </svg>
    ),
    car: (
      // Retro Pixel Car
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        className={`pixel-art ${className}`}
      >
        <rect x="4" y="4" width="8" height="3" />
        <rect x="1" y="7" width="14" height="4" />
        <rect x="3" y="11" width="3" height="2" />
        <rect x="10" y="11" width="3" height="2" />
      </svg>
    ),
  };

  return iconMap[name] || iconMap["heart"];
}

export const AVAILABLE_GOAL_ICONS: { id: PixelIconType; label: string }[] = [
  { id: "plane", label: "Plane (Travel)" },
  { id: "house", label: "House (Home)" },
  { id: "kitchen", label: "Kitchen (Cooking)" },
  { id: "sofa", label: "Sofa (Furniture)" },
  { id: "ring", label: "Ring (Jewellery)" },
  { id: "heart", label: "Heart (Love)" },
  { id: "gift", label: "Gift Box (Shagun)" },
  { id: "camera", label: "Camera (Moments)" },
  { id: "car", label: "Car (Drive)" },
];
