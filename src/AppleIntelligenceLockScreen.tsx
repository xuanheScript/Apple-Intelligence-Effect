import React, { useEffect, useState, CSSProperties } from "react";
import { AppleIntelligenceGlow } from "./AppleIntelligenceGlow";

// ---- SSR safety check ----
const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

// ---- Types ----
export interface AppleIntelligenceLockScreenProps {
  /** 宽度（默认 360） */
  width?: number | string;
  /** 高度（默认 720） */
  height?: number | string;
  /** 是否激活发光效果（默认 true） */
  isActive?: boolean;
  /** 是否暂停动画（默认 false） */
  isPaused?: boolean;
  /** 自定义 className */
  className?: string;
  /** 自定义 style */
  style?: CSSProperties;
}

interface DateTime {
  time: string;
  date: string;
}

// ---- 样式注入 ----
const STYLE_ID = "apple-intelligence-lock-screen-styles";

const CSS = `
.aie-lock-screen {
  position: relative;
  background: linear-gradient(180deg, #000000 0%, #1a1a1a 100%);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
  overflow: hidden;
}

.aie-lock-ui {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
  color: white;
}

.aie-dynamic-island {
  width: 120px;
  height: 35px;
  background-color: black;
  border-radius: 20px;
  margin-top: 8px;
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
`;

function injectStylesOnce(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const styleTag = document.createElement("style");
  styleTag.id = STYLE_ID;
  styleTag.innerHTML = CSS;
  document.head.appendChild(styleTag);
}

// ---- 时间与日期 ----

function getDateTime(): DateTime {
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
 * Apple Intelligence 风格的锁屏组件
 * 基于 AppleIntelligenceGlow 组件，自动获得所有性能优化
 */
export function AppleIntelligenceLockScreen({
  width = 360,
  height = 720,
  isActive = true,
  isPaused = false,
  className = "",
  style = {},
}: AppleIntelligenceLockScreenProps): React.JSX.Element {
  const [{ time, date }, setDateTime] = useState<DateTime>({ time: "--:--", date: "" });

  // 注入锁屏专用样式
  useEffect(() => {
    injectStylesOnce();
  }, []);

  // 更新时间
  useEffect(() => {
    if (!isBrowser) return;
    setDateTime(getDateTime());
    const id = setInterval(() => {
      setDateTime(getDateTime());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const sizeStyle: CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    ...style,
  };

  return (
    <AppleIntelligenceGlow
      isActive={isActive}
      isPaused={isPaused}
      radius={50}
      className={`aie-lock-screen ${className}`}
      style={sizeStyle}
    >
      <div className="aie-lock-ui">
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
    </AppleIntelligenceGlow>
  );
}
