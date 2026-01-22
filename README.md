# apple-intelligence-glow-react

Apple Intelligence–inspired animated glow border as a reusable React component.

[![npm version](https://img.shields.io/npm/v/apple-intelligence-glow-react.svg)](https://www.npmjs.com/package/apple-intelligence-glow-react)
[![license](https://img.shields.io/npm/l/apple-intelligence-glow-react.svg)](https://github.com/xuanheScript/Apple-Intelligence-Effect/blob/main/LICENSE)

**[Live Demo](https://xuanhescript.github.io/Apple-Intelligence-Effect/)**

![Glow Demo](./glow_demo.png)

## Features

- Multiple glow states: `idle`, `hover`, `focus`, `thinking`, `success`, `error`
- Smooth state transitions with CSS animations
- SSR compatible (Next.js, Remix, etc.)
- Respects `prefers-reduced-motion`
- TypeScript support
- Zero dependencies (only React peer dependency)

## Components

- **`AppleIntelligenceGlow`** – Core reusable glow container with state support
- **`AppleIntelligenceLockScreen`** – Demo lock screen UI with dynamic island and live clock

---

## Installation

```bash
npm install apple-intelligence-glow-react
```

or with yarn / pnpm:

```bash
yarn add apple-intelligence-glow-react
# or
pnpm add apple-intelligence-glow-react
```

---

## Quick Start

```jsx
import { AppleIntelligenceGlow } from "apple-intelligence-glow-react";

function App() {
  return (
    <AppleIntelligenceGlow
      state="thinking"
      radius={24}
      style={{
        width: 300,
        height: 200,
        background: "#1a1a2e",
        padding: 20,
      }}
    >
      <div style={{ color: "#fff" }}>
        AI is thinking...
      </div>
    </AppleIntelligenceGlow>
  );
}
```

---

## State Control

The component supports 6 different visual states:

```jsx
import { useState } from "react";
import { AppleIntelligenceGlow, GlowState } from "apple-intelligence-glow-react";

function AIInput() {
  const [state, setState] = useState<GlowState>("idle");

  return (
    <AppleIntelligenceGlow
      state={state}
      radius={16}
      onMouseEnter={() => setState("hover")}
      onMouseLeave={() => setState("idle")}
      onFocus={() => setState("focus")}
    >
      <textarea placeholder="Ask AI..." />
    </AppleIntelligenceGlow>
  );
}
```

| State | Description | Visual Effect |
|-------|-------------|---------------|
| `idle` | Default state | Very subtle glow (15% intensity) |
| `hover` | Mouse hover | Light highlight (35% intensity) |
| `focus` | Input focused | Clear focus ring (55% intensity) |
| `thinking` | AI processing | Animated gradient (75% intensity, faster rotation) |
| `success` | Task complete | Bloom effect (100% intensity) |
| `error` | Error state | Solid red glow (no rotation) |

---

## API Reference

### `AppleIntelligenceGlow`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `state` | `GlowState` | `"thinking"` | Visual state of the glow |
| `isActive` | `boolean` | `true` | Enable/disable glow effect |
| `isPaused` | `boolean` | `false` | Pause animation (keeps current state) |
| `radius` | `number \| string` | `50` | Border radius |
| `className` | `string` | - | Custom CSS class |
| `style` | `CSSProperties` | - | Inline styles |
| `children` | `ReactNode` | - | Content to wrap |

### `AppleIntelligenceLockScreen`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number \| string` | `360` | Phone frame width |
| `height` | `number \| string` | `720` | Phone frame height |
| `isActive` | `boolean` | `true` | Enable/disable glow |
| `isPaused` | `boolean` | `false` | Pause animation |
| `className` | `string` | - | Custom CSS class |
| `style` | `CSSProperties` | - | Inline styles |

### `GlowState` Type

```typescript
type GlowState = "idle" | "hover" | "focus" | "thinking" | "success" | "error";
```

---

## Custom Colors

Override the default gradient colors using CSS variables:

```jsx
<AppleIntelligenceGlow
  style={{
    "--aie-color-1": "#00FF00",
    "--aie-color-2": "#00CC00",
    "--aie-color-3": "#009900",
    "--aie-color-4": "#006600",
    "--aie-color-5": "#003300",
    "--aie-color-6": "#00FF00",
  }}
>
  {/* Green theme */}
</AppleIntelligenceGlow>
```

---

## Examples

### AI Chat Input

```jsx
function AIChatInput() {
  const [state, setState] = useState("idle");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setState("thinking");
    setIsLoading(true);

    try {
      await sendMessage();
      setState("success");
    } catch {
      setState("error");
    } finally {
      setIsLoading(false);
      setTimeout(() => setState("idle"), 2000);
    }
  };

  return (
    <AppleIntelligenceGlow state={state} radius={12}>
      <input
        onFocus={() => !isLoading && setState("focus")}
        onBlur={() => !isLoading && setState("idle")}
      />
      <button onClick={handleSubmit}>Send</button>
    </AppleIntelligenceGlow>
  );
}
```

### Card with Hover Effect

```jsx
<AppleIntelligenceGlow
  state={isHovered ? "hover" : "idle"}
  radius={20}
  className="card"
>
  <h2>Premium Feature</h2>
  <p>Unlock AI capabilities</p>
</AppleIntelligenceGlow>
```

---

## License

MIT
