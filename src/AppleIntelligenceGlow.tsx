import React, { useEffect, CSSProperties, ReactNode, useMemo } from "react";

// ---- Types ----

/** 光效状态 */
export type GlowState =
  | "idle"
  | "hover"
  | "focus"
  | "thinking"
  | "success"
  | "error";

/** 状态配置 */
interface StateConfig {
  /** 整体强度 0~1 */
  intensity: number;
  /** 速度倍率（1 = 正常，<1 更慢，>1 更快） */
  speedScale: number;
  /** 模糊缩放（1 = 正常） */
  blurScale: number;
  /** 是否使用单色（用于 error 等警示状态） */
  monochrome?: string;
}

/** 单层光环配置 */
interface GlowRingConfig {
  /** 边框宽度 */
  width: number;
  /** 模糊半径 */
  blur: number;
  /** 基础旋转速度（秒） */
  speed: number;
  /** 基础透明度 */
  opacity: number;
}

export interface AppleIntelligenceGlowProps {
  /** 是否激活发光效果（默认 true）。设为 false 时只渲染 children，用于性能优化 */
  isActive?: boolean;
  /** 是否暂停动画（默认 false）。暂停时保持当前渐变状态，不消耗 CPU */
  isPaused?: boolean;
  /** 光效状态（默认 "thinking"）。不同状态有不同的强度、速度和视觉效果 */
  state?: GlowState;
  /** 圆角半径（默认 50px） */
  radius?: number | string;
  /** 自定义 className */
  className?: string;
  /** 自定义 style */
  style?: CSSProperties;
  /** 子元素 */
  children?: ReactNode;
}

// ---- 状态预设配置 ----
const STATE_CONFIGS: Record<GlowState, StateConfig> = {
  idle: {
    intensity: 0.15,
    speedScale: 0.7,
    blurScale: 1.2,
  },
  hover: {
    intensity: 0.35,
    speedScale: 0.8,
    blurScale: 1,
  },
  focus: {
    intensity: 0.55,
    speedScale: 0.9,
    blurScale: 0.7, // 更清晰的 focus ring
  },
  thinking: {
    intensity: 0.75,
    speedScale: 1.2, // 略快，体现"思考中"
    blurScale: 1,
  },
  success: {
    intensity: 1,
    speedScale: 0.5, // 成功后缓慢
    blurScale: 1.3, // bloom 效果
  },
  error: {
    intensity: 0.6,
    speedScale: 0,  // 不旋转
    blurScale: 0.8,
    monochrome: "#FF6B6B", // 单色警示红
  },
};

// ---- Ring 基础配置：多层光环，不同模糊和速度 ----
const BASE_RING_CONFIGS: GlowRingConfig[] = [
  { width: 5, blur: 0, speed: 4, opacity: 0.85 },
  { width: 8, blur: 5, speed: 5, opacity: 0.4 },
  { width: 10, blur: 15, speed: 6, opacity: 0.3 },
  { width: 15, blur: 25, speed: 7, opacity: 0.25 },
];

// ---- 微噪声纹理 SVG ----
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

// ---- Styles injection ----

const STYLE_ID = "apple-intelligence-glow-styles";

const CSS = `
@property --aie-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

/* ---- Design Tokens ---- */
:root {
  /* 彩虹渐变色 */
  --aie-color-1: #BC82F3;
  --aie-color-2: #F5B9EA;
  --aie-color-3: #8D9FFF;
  --aie-color-4: #FF6778;
  --aie-color-5: #FFBA71;
  --aie-color-6: #C686FF;
}

.aie-glow-root {
  position: relative;
  display: inline-block;
  border-radius: var(--aie-radius, 32px);
  overflow: hidden;
  isolation: isolate;
  transform: translateZ(0);
}

.aie-glow-rings {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  border-radius: var(--aie-radius, 32px);
  overflow: hidden;
  -webkit-clip-path: inset(0 round var(--aie-radius, 32px));
  clip-path: inset(0 round var(--aie-radius, 32px));
  /* 状态切换过渡 */
  transition: opacity 0.4s ease-out;
}

.aie-glow-content {
  position: relative;
  z-index: 2;
}

.aie-noise-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.03;
  mix-blend-mode: overlay;
  border-radius: var(--aie-radius, 32px);
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
  mix-blend-mode: screen;
  mix-blend-mode: plus-lighter;
  /* 状态切换过渡 */
  transition: opacity 0.4s ease-out, filter 0.4s ease-out;
}

.aie-ring-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: var(--aie-radius, 32px);
}

.aie-gradient-ring {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--aie-radius, 32px);
  background-image: var(--aie-gradient);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: aie-rotate var(--aie-speed, 5s) linear infinite;
  animation-play-state: var(--aie-play-state, running);
}

/* 单色模式（error 等状态） */
.aie-gradient-ring[data-monochrome="true"] {
  animation: none;
}

@keyframes aie-rotate {
  to {
    --aie-angle: 360deg;
  }
}

/* Success bloom 动画 */
@keyframes aie-bloom {
  0% {
    transform: scale(1);
    opacity: var(--aie-base-opacity, 1);
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: var(--aie-base-opacity, 1);
  }
}

.aie-glow-root[data-state="success"] .aie-effect-layer {
  animation: aie-bloom 0.6s ease-out;
}

/* 暂停状态 */
.aie-glow-root[data-paused="true"] .aie-gradient-ring {
  animation-play-state: paused;
}

/* 尊重用户的减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .aie-gradient-ring {
    animation: none;
    --aie-angle: 45deg;
  }
  .aie-glow-root[data-state="success"] .aie-effect-layer {
    animation: none;
  }
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

// ---- 计算状态相关的 ring 配置 ----
function computeRingConfig(
  base: GlowRingConfig,
  stateConfig: StateConfig
): GlowRingConfig & { gradient: string } {
  const { intensity, speedScale, blurScale, monochrome } = stateConfig;

  // 彩虹渐变或单色
  const gradient = monochrome
    ? `conic-gradient(from var(--aie-angle), ${monochrome}, ${monochrome})`
    : `conic-gradient(
        from var(--aie-angle),
        var(--aie-color-1, #BC82F3),
        var(--aie-color-2, #F5B9EA),
        var(--aie-color-3, #8D9FFF),
        var(--aie-color-4, #FF6778),
        var(--aie-color-5, #FFBA71),
        var(--aie-color-6, #C686FF),
        var(--aie-color-1, #BC82F3)
      )`;

  return {
    width: base.width,
    blur: base.blur * blurScale,
    speed: speedScale > 0 ? base.speed / speedScale : 0,
    opacity: base.opacity * intensity,
    gradient,
  };
}

// ---- 纯 CSS 渲染的光环 ----
interface GlowRingProps {
  config: GlowRingConfig & { gradient: string };
  isMonochrome: boolean;
}

function GlowRing({ config, isMonochrome }: GlowRingProps): React.JSX.Element {
  const layerStyle: CSSProperties = {
    filter: config.blur > 0 ? `blur(${config.blur}px)` : undefined,
    opacity: config.opacity,
    "--aie-base-opacity": config.opacity,
  } as CSSProperties;

  const ringStyle: CSSProperties = {
    padding: `${config.width}px`,
    "--aie-speed": config.speed > 0 ? `${config.speed}s` : "0s",
    "--aie-gradient": config.gradient,
  } as CSSProperties;

  return (
    <div className="aie-effect-layer" style={layerStyle}>
      <div className="aie-ring-container">
        <div
          className="aie-gradient-ring"
          style={ringStyle}
          data-monochrome={isMonochrome || undefined}
        />
      </div>
    </div>
  );
}

/**
 * Apple Intelligence 风格的 glow 边框组件
 *
 * 特点：
 * - 使用 CSS @property + keyframes 实现丝滑连续旋转
 * - 多层光环叠加，不同模糊和速度
 * - 支持多种状态：idle / hover / focus / thinking / success / error
 * - 支持 SSR
 * - 尊重 prefers-reduced-motion
 *
 * @example
 * // 基础用法
 * <AppleIntelligenceGlow>
 *   <div>Your content</div>
 * </AppleIntelligenceGlow>
 *
 * @example
 * // 状态控制
 * <AppleIntelligenceGlow state="thinking">
 *   <AIInput />
 * </AppleIntelligenceGlow>
 *
 * @example
 * // 自定义颜色（通过 CSS 变量）
 * <AppleIntelligenceGlow style={{ '--aie-color-1': '#00FF00' }}>
 *   <div>Custom colors</div>
 * </AppleIntelligenceGlow>
 */
export function AppleIntelligenceGlow({
  isActive = true,
  isPaused = false,
  state = "thinking",
  radius = 50,
  className = "",
  style = {},
  children,
}: AppleIntelligenceGlowProps): React.JSX.Element {
  // 注入全局样式
  useEffect(() => {
    if (isActive) {
      injectStylesOnce();
    }
  }, [isActive]);

  // 获取当前状态配置
  const stateConfig = STATE_CONFIGS[state];

  // 计算当前状态下的 ring 配置
  const ringConfigs = useMemo(
    () =>
      BASE_RING_CONFIGS.map((base) => computeRingConfig(base, stateConfig)),
    [stateConfig]
  );

  const mergedStyle: CSSProperties = {
    "--aie-radius": typeof radius === "number" ? `${radius}px` : radius,
    ...style,
  } as CSSProperties;

  return (
    <div
      className={`aie-glow-root ${className}`}
      style={mergedStyle}
      data-paused={isPaused || undefined}
      data-active={isActive || undefined}
      data-state={state}
    >
      {isActive && (
        <>
          <div className="aie-glow-rings">
            {ringConfigs.map((config, index) => (
              <GlowRing
                key={index}
                config={config}
                isMonochrome={!!stateConfig.monochrome}
              />
            ))}
          </div>
          <div
            className="aie-noise-overlay"
            style={{ backgroundImage: NOISE_SVG }}
          />
        </>
      )}
      <div className="aie-glow-content">{children}</div>
    </div>
  );
}

// ---- 导出状态配置，方便外部使用 ----
export { STATE_CONFIGS };
export type { StateConfig, GlowRingConfig };
