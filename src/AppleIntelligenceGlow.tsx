import React, { useEffect, CSSProperties, ReactNode } from "react";

// ---- Types ----
interface GlowRingConfig {
  /** 边框宽度 */
  width: number;
  /** 模糊半径 */
  blur: number;
  /** 旋转速度（秒） */
  speed: number;
  /** 透明度 */
  opacity: number;
}

export interface AppleIntelligenceGlowProps {
  /** 是否激活发光效果（默认 true）。设为 false 时只渲染 children，用于性能优化 */
  isActive?: boolean;
  /** 是否暂停动画（默认 false）。暂停时保持当前渐变状态，不消耗 CPU */
  isPaused?: boolean;
  /** 圆角半径（默认 50px） */
  radius?: number | string;
  /** 自定义 className */
  className?: string;
  /** 自定义 style */
  style?: CSSProperties;
  /** 子元素 */
  children?: ReactNode;
}

// ---- Ring 配置：多层光环，不同模糊和速度 ----
// opacity 大幅降低，避免 plus-lighter 叠加过曝
const RING_CONFIGS: GlowRingConfig[] = [
  { width: 5, blur: 0, speed: 4, opacity: 0.85 },
  { width: 8, blur: 5, speed: 5, opacity: 0.4 },
  { width: 10, blur: 15, speed: 6, opacity: 0.3 },
  { width: 15, blur: 25, speed: 7, opacity: 0.25 },
];

// ---- 微噪声纹理 SVG (内联 base64，避免额外请求) ----
// 使用 feTurbulence 生成的细腻噪声，让光效更有质感
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

// ---- Styles injection ----

const STYLE_ID = "apple-intelligence-glow-styles";

// 使用 @property 实现连续旋转，避免随机跳变
const CSS = `
@property --aie-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

.aie-glow-root {
  position: relative;
  display: inline-block;
  border-radius: var(--aie-radius, 32px);
  overflow: hidden;
  isolation: isolate;   /* 关键 */
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
  /* 强制裁剪 blur 溢出，clip-path 比 overflow:hidden 更有效 */
  border-radius: var(--aie-radius, 32px);
  overflow: hidden;
  -webkit-clip-path: inset(0 round var(--aie-radius, 32px));
  clip-path: inset(0 round var(--aie-radius, 32px));
}

.aie-glow-content {
  position: relative;
  z-index: 2;
}

/* 微噪声纹理层：让光效更有 iOS 质感 */
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
  /* plus-lighter 在 Safari 效果更好，screen 作为 fallback */
  mix-blend-mode: screen;
  mix-blend-mode: plus-lighter;
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
  background-image: conic-gradient(
    from var(--aie-angle),
    #BC82F3,
    #F5B9EA,
    #8D9FFF,
    #FF6778,
    #FFBA71,
    #C686FF,
    #BC82F3
  );
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

@keyframes aie-rotate {
  to {
    --aie-angle: 360deg;
  }
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

// ---- 纯 CSS 渲染的光环 ----
function GlowRing({ config }: { config: GlowRingConfig }): React.JSX.Element {
  const layerStyle: CSSProperties = {
    filter: config.blur > 0 ? `blur(${config.blur}px)` : undefined,
    opacity: config.opacity,
  };

  const ringStyle: CSSProperties = {
    padding: `${config.width}px`,
    "--aie-speed": `${config.speed}s`,
  } as CSSProperties;

  return (
    <div className="aie-effect-layer" style={layerStyle}>
      <div className="aie-ring-container">
        <div className="aie-gradient-ring" style={ringStyle} />
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
 * - mix-blend-mode: screen 让光效更自然
 * - 支持 SSR
 * - 尊重 prefers-reduced-motion
 */

export function AppleIntelligenceGlow({
  isActive = true,
  isPaused = false,
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
    >
      {isActive && (
        <>
          <div className="aie-glow-rings">
            {RING_CONFIGS.map((config, index) => (
              <GlowRing key={index} config={config} />
            ))}
          </div>
          {/* 微噪声纹理：3% opacity，增加光效质感 */}
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
