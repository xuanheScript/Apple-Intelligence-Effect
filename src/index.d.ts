import * as React from "react";

export interface AppleIntelligenceGlowProps {
  /**
   * Whether the glow effect is active. When false, only renders children without glow effect.
   * Useful for performance optimization when the effect is conditionally needed.
   * @default true
   */
  isActive?: boolean;
  /**
   * Border radius of the glow effect
   * @default 50
   */
  radius?: number | string;
  /**
   * Additional CSS class name
   */
  className?: string;
  /**
   * Inline styles
   */
  style?: React.CSSProperties;
  /**
   * Content to render inside the glow container
   */
  children?: React.ReactNode;
}

export interface AppleIntelligenceLockScreenProps {
  /**
   * Width of the lock screen
   * @default 360
   */
  width?: number | string;
  /**
   * Height of the lock screen
   * @default 720
   */
  height?: number | string;
  /**
   * Whether to show helper text at the bottom
   * @default true
   */
  showHelperText?: boolean;
  /**
   * Additional CSS class name
   */
  className?: string;
  /**
   * Inline styles
   */
  style?: React.CSSProperties;
}

/**
 * Apple Intelligence style glow border component.
 * Wrap any content to add the animated glow effect.
 */
export declare function AppleIntelligenceGlow(
  props: AppleIntelligenceGlowProps
): React.JSX.Element;

/**
 * Apple Intelligence style lock screen component with glow effect.
 * Displays a simulated iPhone lock screen with dynamic island, time, and date.
 */
export declare function AppleIntelligenceLockScreen(
  props: AppleIntelligenceLockScreenProps
): React.JSX.Element;
