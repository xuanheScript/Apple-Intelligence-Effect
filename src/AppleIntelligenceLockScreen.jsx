import React, { useEffect, useRef, useState } from "react";

// ---- SSR safety check ----
const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

// ---- Glow Logic (adapted from original demo) ----

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

// ---- Styles injection (so users只需要引组件，不用单独引 CSS) ----

const STYLE_ID = "apple-intelligence-lock-screen-styles";

const CSS = String.raw`
.aie-root {
  --phone-width: 360px;
  --phone-height: 720px;
  --phone-radius: 50px;
  --bezel-width: 12px;

  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
}

.aie-iphone-chassis {
  position: relative;
  width: var(--phone-width);
  height: var(--phone-height);
  border-radius: var(--phone-radius);
  background-color: #000;
  box-shadow:
    0 0 0 6px #333,
    0 0 0 7px #000,
    0 20px 50px rgba(0, 0, 0, 0.5);
  z-index: 1;
  overflow: hidden;
}

.aie-glow-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  pointer-events: none;
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
  border-radius: var(--phone-radius);
}

.aie-gradient-buffer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--phone-radius);
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

.aie-wallpaper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #000000 0%, #1a1a1a 100%);
  z-index: 0;
  opacity: 0.9;
}

.aie-ui-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
  color: white;
  pointer-events: none;
}

.aie-dynamic-island {
  width: 120px;
  height: 35px;
  background-color: black;
  border-radius: 20px;
  margin-top: 8px;
  z-index: 30;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.aie-island-sensors {
  width: 40%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
}

.aie-island-dot {
  width: 8px;
  height: 8px;
  background: #1a1a1a;
  border-radius: 50%;
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.1);
}

.aie-lock-header {
  margin-top: 35px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.aie-date {
  font-size: 1.3rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 0;
}

.aie-time {
  font-size: 5.8rem;
  font-weight: 600;
  line-height: 1;
  margin: 0;
  color: rgba(255, 255, 255, 1);
  letter-spacing: -1px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.aie-bottom-bar {
  width: 130px;
  height: 5px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  margin-bottom: 8px;
  margin-top: auto;
}

.aie-helper-text {
  margin-top: 8px;
  color: #666;
  font-size: 0.9rem;
  text-align: center;
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

// ---- 时间与日期 ----

function getDateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return {
    time: `${hours}:${minutes}`,
    date: dateFormatter.format(now),
  };
}

/**
 * Apple Intelligence 风格的锁屏 + Glow 效果。
 *
 * props:
 * - width, height: 数字或字符串，控制手机尺寸（默认 360x720）
 * - showHelperText: 是否在底部显示说明文字
 * - className, style: 透传给最外层容器，方便自定义布局
 */
export function AppleIntelligenceLockScreen({
  width = 360,
  height = 720,
  showHelperText = true,
  className = "",
  style = {},
}) {
  const glowContainerRef = useRef(null);
  // Use empty initial state to avoid hydration mismatch (server/client time difference)
  const [{ time, date }, setDateTime] = useState({ time: "--:--", date: "" });

  // 注入全局样式
  useEffect(() => {
    injectStylesOnce();
  }, []);

  // 更新时间 - initialize and update only on client side
  useEffect(() => {
    if (!isBrowser) return;
    // Initialize time immediately on mount
    setDateTime(getDateTime());
    const id = setInterval(() => {
      setDateTime(getDateTime());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // 初始化 Glow 效果
  useEffect(() => {
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
  }, []);

  const sizeStyle = {
    "--phone-width": typeof width === "number" ? `${width}px` : width,
    "--phone-height": typeof height === "number" ? `${height}px` : height,
    ...style,
  };

  return (
    <div className={`aie-root ${className}`} style={sizeStyle}>
      <div className="aie-iphone-chassis">
        <div className="aie-wallpaper" />
        <div ref={glowContainerRef} className="aie-glow-container" />

        <div className="aie-ui-layer">
          <div className="aie-dynamic-island">
            <div className="aie-island-sensors">
              <div className="aie-island-dot" />
            </div>
          </div>

          <div className="aie-lock-header">
            <div className="aie-date">{date}</div>
            <div className="aie-time">{time}</div>
          </div>

          <div className="aie-bottom-bar" />
        </div>
      </div>

      {showHelperText && (
        <div className="aie-helper-text">CSS + JS Re-creation of Apple Intelligence Glow</div>
      )}
    </div>
  );
}


