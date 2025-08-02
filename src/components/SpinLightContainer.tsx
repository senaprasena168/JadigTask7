'use client';

import React, { ReactNode } from 'react';
import styles from './SpinLightContainer.module.css';

/**
 * SpinLightContainer - A reusable component that provides animated spinning light effects
 * 
 * This component creates a container with dual rotating gradient animations:
 * - Blue gradient container rotating perpendicular (90° offset)
 * - Red/Pink gradient container rotating normally
 * - Both containers have 4s rotation cycles with -1s animation delay
 * 
 * Features:
 * - Hover-triggered expansion (optional)
 * - Customizable dimensions via props
 * - Modular design for reuse across different components
 * - Maintains the same visual effects as the original login card
 * 
 * Usage:
 * <SpinLightContainer width={300} height={80} expandOnHover={true}>
 *   <YourContent />
 * </SpinLightContainer>
 */

export interface SpinLightContainerProps {
  children: ReactNode;
  width?: number;
  height?: number;
  expandedWidth?: number;
  expandedHeight?: number;
  expandOnHover?: boolean;
  className?: string;
  onHoverChange?: (isHovered: boolean) => void;
}

export const SpinLightContainer: React.FC<SpinLightContainerProps> = ({
  children,
  width = 300,
  height = 80,
  expandedWidth = 380,
  expandedHeight = 550,
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

export default SpinLightContainer;