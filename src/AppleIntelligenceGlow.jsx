import React, { useEffect, useRef } from "react";

// ---- SSR safety check ----
const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

// ---- Core glow logic (only负责边缘光效，不包含具体 UI) ----

const COLORS = ["#BC82F3", "#F5B9EA", "#8D9FFF", "#FF6778", "#FFBA71", "#C686FF"];

function generateConicGradientString() {
  const stops = COLORS.map((color) => ({
    color,
    location: Math.random() * 100,
  })).sort((a, b) => a.location - b.location);

  const stopStrings = stops.map((s) => `${s.color} ${s.location.toFixed(2)}%`);
  return `conic-gradient(from 0deg, ${stopStrings.join(", ")})`;
}

class GlowRing {
  constructor(container, config) {
    // SSR safety: only run in browser environment
    if (!isBrowser) return;

    this.width = config.width;
    this.blur = config.blur;
    this.interval = config.interval * 1000;
    this.duration = config.duration;
    this.timerId = null;

    this.el = document.createElement("div");
    this.el.className = "aie-effect-layer";

    if (this.blur > 0) {
      this.el.style.filter = `blur(${this.blur}px)`;
    }

    const ring = document.createElement("div");
    ring.className = "aie-ring-container";

    this.buffer1 = this.createBuffer();
    this.buffer2 = this.createBuffer();
    this.activeBuffer = 1;

    this.setGradient(this.buffer1, generateConicGradientString());
    this.buffer1.style.opacity = 1;
    this.buffer2.style.opacity = 0;

    ring.appendChild(this.buffer1);
    ring.appendChild(this.buffer2);
    this.el.appendChild(ring);
    container.appendChild(this.el);

    this.startTimer();
  }

  createBuffer() {
    if (!isBrowser) return null;
    const div = document.createElement("div");
    div.className = "aie-gradient-buffer";
    div.style.padding = `${this.width}px`;
    div.style.transitionDuration = `${this.duration}s`;
    div.style.transitionTimingFunction = "ease-in-out";
    return div;
  }

  setGradient(element, gradientString) {
    if (element) {
      element.style.backgroundImage = gradientString;
    }
  }

  startTimer() {
    if (!isBrowser) return;
    this.timerId = setInterval(() => {
      this.animate();
    }, this.interval);
  }

  animate() {
    if (!isBrowser) return;
    const newGradient = generateConicGradientString();

    if (this.activeBuffer === 1) {
      this.setGradient(this.buffer2, newGradient);
      this.buffer2.style.opacity = 1;
      this.buffer1.style.opacity = 0;
      this.activeBuffer = 2;
    } else {
      this.setGradient(this.buffer1, newGradient);
      this.buffer1.style.opacity = 1;
      this.buffer2.style.opacity = 0;
      this.activeBuffer = 1;
    }
  }

  destroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}

// ---- Styles injection for纯 Glow 容器 ----

const STYLE_ID = "apple-intelligence-glow-styles";

const CSS = String.raw`
.aie-glow-root {
  position: relative;
  display: inline-block;
  border-radius: var(--aie-radius, 32px);
  overflow: hidden;
}

.aie-glow-rings {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
}

.aie-glow-content {
  position: relative;
  z-index: 1;
}

.aie-effect-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.aie-ring-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: var(--aie-radius, 32px);
}

.aie-gradient-buffer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--aie-radius, 32px);
  background-repeat: no-repeat;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  transition-property: opacity;
  will-change: opacity;
}
`;

function injectStylesOnce() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const styleTag = document.createElement("style");
  styleTag.id = STYLE_ID;
  styleTag.innerHTML = CSS;
  document.head.appendChild(styleTag);
}

/**
 * 只负责 Apple Intelligence 风格的 glow 边框，你可以在里面放任意内容。
 *
 * props:
 * - isActive: 是否激活发光效果（默认 true）。设为 false 时只渲染 children，用于性能优化
 * - radius: 数字或字符串，控制圆角半径（默认 50px）
 * - className, style: 挂在最外层 glow 容器上
 * - children: 你的内容（锁屏、卡片、面板都行）
 */
export function AppleIntelligenceGlow({
  isActive = true,
  radius = 50,
  className = "",
  style = {},
  children,
}) {
  const glowContainerRef = useRef(null);

  // 注入全局样式（仅在激活时）
  useEffect(() => {
    if (isActive) {
      injectStylesOnce();
    }
  }, [isActive]);

  // 初始化 Glow 效果（仅在激活时）
  useEffect(() => {
    if (!isActive) return;

    const container = glowContainerRef.current;
    if (!container) return;

    const rings = [
      new GlowRing(container, { width: 5, blur: 0, interval: 0.4, duration: 0.5 }),
      new GlowRing(container, { width: 8, blur: 5, interval: 0.4, duration: 0.6 }),
      new GlowRing(container, { width: 10, blur: 15, interval: 0.4, duration: 0.8 }),
      new GlowRing(container, { width: 15, blur: 25, interval: 0.5, duration: 1.0 }),
    ];

    return () => {
      rings.forEach((r) => r.destroy());
      container.innerHTML = "";
    };
  }, [isActive]);

  // 未激活时，只渲染 children（保持相同的 DOM 结构以避免重新挂载）
  if (!isActive) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const mergedStyle = {
    "--aie-radius": typeof radius === "number" ? `${radius}px` : radius,
    ...style,
  };

  return (
    <div className={`aie-glow-root ${className}`} style={mergedStyle}>
      <div ref={glowContainerRef} className="aie-glow-rings" />
      <div className="aie-glow-content">{children}</div>
    </div>
  );
}


