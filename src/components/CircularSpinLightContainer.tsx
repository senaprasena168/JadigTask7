'use client';

import React, { ReactNode } from 'react';
import styles from './CircularSpinLightContainer.module.css';

/**
 * CircularSpinLightContainer - A circular variant of SpinLightContainer optimized for buttons
 * 
 * This component creates a perfectly circular container with dual rotating gradient animations:
 * - Blue gradient container rotating perpendicular (90° offset)
 * - Red/Pink gradient container rotating normally
 * - Both containers have 4s rotation cycles with -1s animation delay
 * - Optimized with minimal padding for button/avatar use cases
 * 
 * Features:
 * - Perfect circular shape (border-radius: 50%)
 * - Minimal padding (4px) for larger content area
 * - Hover-triggered expansion (optional)
 * - Same spinning light effects as SpinLightContainer
 * - Ideal for floating buttons, avatars, and circular UI elements
 * 
 * Usage:
 * <CircularSpinLightContainer width={64} height={64} expandOnHover={true}>
 *   <img src="avatar.jpg" alt="Avatar" />
 * </CircularSpinLightContainer>
 */

export interface CircularSpinLightContainerProps {
  /** Content to be rendered inside the circular spinning light container */
  children: ReactNode;
  
  /** Initial width of the container in pixels (default: 64) */
  width?: number;
  
  /** Initial height of the container in pixels (default: 64) */
  height?: number;
  
  /** Expanded width when hovered in pixels (default: 72) */
  expandedWidth?: number;
  
  /** Expanded height when hovered in pixels (default: 72) */
  expandedHeight?: number;
  
  /** Whether the container should expand on hover (default: false) */
  expandOnHover?: boolean;
  
  /** Additional CSS classes to apply to the root container */
  className?: string;
  
  /** Callback function called when hover state changes */
  onHoverChange?: (isHovered: boolean) => void;
}

export const CircularSpinLightContainer: React.FC<CircularSpinLightContainerProps> = ({
  children,
  width = 64,
  height = 64,
  expandedWidth = 72,
  expandedHeight = 72,
  expandOnHover = false,
  className = '',
  onHoverChange,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => {
    if (expandOnHover) {
      setIsHovered(true);
      onHoverChange?.(true);
    }
  };

  const handleMouseLeave = () => {
    if (expandOnHover) {
      setIsHovered(false);
      onHoverChange?.(false);
    }
  };

  const containerStyle = {
    width: isHovered ? `${expandedWidth}px` : `${width}px`,
    height: isHovered ? `${expandedHeight}px` : `${height}px`,
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div
        className={`${styles.box} ${isHovered ? styles.hovered : ''}`}
        style={containerStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Blue gradient container - rotates perpendicular (90° offset) */}
        <div className={styles.gradientContainer}>
          <div className={`${styles.gradientBox} ${styles.gradientBox1}`}></div>
          <div className={`${styles.gradientBox} ${styles.gradientBox2}`}></div>
        </div>

        {/* Red/Pink gradient container - rotates normally */}
        <div className={styles.redGradientContainer}>
          <div className={`${styles.redGradientBox} ${styles.redGradientBox1}`}></div>
          <div className={`${styles.redGradientBox} ${styles.redGradientBox2}`}></div>
        </div>

        {/* Content area - where children are rendered */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CircularSpinLightContainer;