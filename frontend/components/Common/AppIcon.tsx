import React from 'react';

interface AppIconProps {
  size?: number;
  className?: string;
  withGlow?: boolean;
}

export const AppIcon: React.FC<AppIconProps> = ({ 
  size = 28, 
  className = '',
  withGlow = false 
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {withGlow && (
        <div 
          className="absolute inset-0 rounded-full bg-[#00E5BF]/15 blur-[6px] pointer-events-none"
        />
      )}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
      >
        {/* Top facet of the prism */}
        <path
          d="M 50 14 L 84 33.5 L 68 43 L 50 32.5 L 32 43 L 16 33.5 Z"
          fill="#4A6566"
        />
        {/* Left vertical facet */}
        <path
          d="M 16 33.5 L 32 43 L 32 67.5 L 16 58 Z"
          fill="#3B5253"
        />
        {/* Right top facet segment */}
        <path
          d="M 84 33.5 L 84 58 L 68 67.5 L 68 43 Z"
          fill="#527071"
        />
        {/* Lower dynamic forward wedge / check (Vivid Cyan Accent) */}
        <path
          d="M 32 67.5 L 50 78 L 84 58 L 84 71.5 L 50 91 L 16 71.5 L 32 67.5 Z"
          fill="#00E5D0"
        />
        {/* Inner shadow/depth facet of the wedge for authentic 3D isometric look */}
        <path
          d="M 50 78 L 84 58 L 84 71.5 L 50 91 Z"
          fill="#00C9B6"
        />
      </svg>
    </div>
  );
};

export default AppIcon;
