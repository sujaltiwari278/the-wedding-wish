# The Wedding Wish — Sprite Sheet Specifications

This document defines the exact specifications for all 2D pixel-art sprite sheets used across The Wedding Wish. Artists can replace the SVG/PNG placeholders by dropping matching assets directly into `/public/sprites/` without modifying any React or CSS code.

---

## Technical Constraints & Rendering Rules

- **Format**: PNG (transparent background) or crisp-edged SVG.
- **Color Palette**: Strictly follow the 6-token theme:
  - Deep Vintage: `#75404F`
  - Vintage Rose: `#9C5968`
  - Dusty Rose: `#D8A7A7`
  - Blush: `#EBCACA`
  - Soft Blush: `#F7E9E5`
  - Cream: `#FFF7F2`
  - *Accents permitted*: Gold/Mustard (`#FBBF24`, `#F59E0B`), Emerald currency (`#10B981`), Black ink (`#2B1810`).
- **Layout**: Strictly single-row horizontal strip (`[Frame 0] [Frame 1] [Frame 2] ... [Frame N-1]`).
- **Rendering**: CSS uses `image-rendering: pixelated;` with `steps(frameCount)`. No anti-aliased blur.

---

## Asset Specifications

### 1. Bride Idle (`bride-idle.svg` / `bride-idle.png`)
- **File**: `public/sprites/bride-idle.svg`
- **Frame Width**: `32px`
- **Frame Height**: `48px`
- **Frame Count**: `4`
- **Total Sheet Dimensions**: `128px × 48px`
- **Default FPS**: `4` (0.25s per frame)
- **Loop**: `true`
- **Frame Breakdown**:
  - `Frame 0 (0px)`: Neutral standing pose, lehenga and dupatta resting, eyes open.
  - `Frame 1 (32px)`: Inhale breathing (+1px chest lift), dupatta slight sway.
  - `Frame 2 (64px)`: Blinking (eyes closed horizontal slit), relaxed posture.
  - `Frame 3 (96px)`: Dupatta settling back, subtle bridal smile.

---

### 2. Groom Idle (`groom-idle.svg` / `groom-idle.png`)
- **File**: `public/sprites/groom-idle.svg`
- **Frame Width**: `32px`
- **Frame Height**: `48px`
- **Frame Count**: `4`
- **Total Sheet Dimensions**: `128px × 48px`
- **Default FPS**: `4`
- **Loop**: `true`
- **Frame Breakdown**:
  - `Frame 0 (0px)`: Neutral standing pose, royal safa/turban with kalgi, sherwani with mala.
  - `Frame 1 (32px)`: Inhale breathing (+1px torso lift).
  - `Frame 2 (64px)`: Blinking (eyes closed), slight head tilt.
  - `Frame 3 (96px)`: Exhale, subtle confident smile.

---

### 3. Couple Celebration (`couple-celebrate.svg` / `couple-celebrate.png`)
- **File**: `public/sprites/couple-celebrate.svg`
- **Frame Width**: `48px`
- **Frame Height**: `48px`
- **Frame Count**: `4`
- **Total Sheet Dimensions**: `192px × 48px`
- **Default FPS**: `6`
- **Loop**: `true`
- **Frame Breakdown**:
  - `Frame 0 (0px)`: Couple cheering, groom left arm raised, bride right arm raised.
  - `Frame 1 (48px)`: Jump/hop (+2px lift), central heart pops up.
  - `Frame 2 (96px)`: Hands high waving, joyful curved eyes, confetti stars popping.
  - `Frame 3 (144px)`: Hands clapping together, floating hearts rising.

---

### 4. Shagun Envelope / Lifafa (`shagun-envelope.svg` / `shagun-envelope.png`)
- **File**: `public/sprites/shagun-envelope.svg`
- **Frame Width**: `32px`
- **Frame Height**: `32px`
- **Frame Count**: `4`
- **Total Sheet Dimensions**: `128px × 32px`
- **Default FPS**: `5`
- **Loop**: `false` (for opening transition) or `true` (for looped preview)
- **Frame Breakdown**:
  - `Frame 0 (0px)`: Auspicious sealed envelope with gold ₹ medallion.
  - `Frame 1 (32px)`: Flap opening upwards, medallion gleams.
  - `Frame 2 (64px)`: Flap fully opened, green currency note peeking out.
  - `Frame 3 (96px)`: Currency note emerging with golden celebration sparkles.

---

### 5. Pixel Gift Box (`gift-box.svg` / `gift-box.png`)
- **File**: `public/sprites/gift-box.svg`
- **Frame Width**: `32px`
- **Frame Height**: `32px`
- **Frame Count**: `4`
- **Total Sheet Dimensions**: `128px × 32px`
- **Default FPS**: `5`
- **Loop**: `false` (or looped preview)
- **Frame Breakdown**:
  - `Frame 0 (0px)`: Wrapped box with gold ribbon and bow.
  - `Frame 1 (32px)`: Ribbon flutter and box bounce.
  - `Frame 2 (64px)`: Lid pops open revealing interior glow.
  - `Frame 3 (96px)`: Stars and hearts burst outward.

---

### 6. Pixel Diya & Marigold Garland (`diya-garland.svg` / `diya-garland.png`)
- **File**: `public/sprites/diya-garland.svg`
- **Frame Width**: `32px`
- **Frame Height**: `32px`
- **Frame Count**: `4`
- **Total Sheet Dimensions**: `128px × 32px`
- **Default FPS**: `6`
- **Loop**: `true`
- **Frame Breakdown**:
  - `Frame 0 (0px)`: Brass diya resting on orange & yellow marigolds, steady flame.
  - `Frame 1 (32px)`: Flame reaches higher.
  - `Frame 2 (64px)`: Flame flickers toward the left.
  - `Frame 3 (96px)`: Flame flickers toward the right with warm aura.

---

## Usage in Code

Each asset can be directly passed to the `<Sprite>` or `<SpriteSequence>` component:

```tsx
import { Sprite } from "@/components/animations/Sprite";

<Sprite
  src="/sprites/bride-idle.svg"
  frameWidth={32}
  frameHeight={48}
  frameCount={4}
  fps={4}
  scale={2}
  alt="Retro Pixel Bride"
/>
```
