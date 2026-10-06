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
          className="absolute inset-0 rounded-full bg-[#00E5BF]/25 blur-[10px] pointer-events-none"
        />
      )}
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-sm"
      >
        {/* Upper Faceted Arch (Muted architectural slate-teal) */}
        <path
          d="M24 6L38 14.5V26L32 22.5V18L24 13L16 18V30L20 32.5V38L10 32V14.5L24 6Z"
          fill="#4B6364"
        />
        {/* Lower Forward Isometric Wedge (Vibrant electric cyan/teal) */}
        <path
          d="M20 32.5L24 35L38 26.5V33L24 41.5L14 35.5L20 32.5Z"
          fill="#00E5BF"
        />
      </svg>
    </div>
  );
};

export default AppIcon;
