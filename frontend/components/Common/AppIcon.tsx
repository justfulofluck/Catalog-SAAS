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
          className="absolute inset-0 rounded-[25%] bg-[#00A651]/20 blur-[8px] pointer-events-none"
        />
      )}
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
      >
        {/* Background Squircle */}
        <rect width="32" height="32" rx="7" fill="#0F3D3E" />
        
        {/* Subtle minimalist border accent */}
        <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" fill="none" stroke="#1C6B6D" strokeWidth="1" strokeOpacity="0.6" />

        {/* Minimalist 'c' glyph */}
        <path
          d="M 19.5 11.2 C 17.8 9.5 14.2 9.2 11.8 11 C 9 13.2 9 18.8 11.8 21 C 14.2 22.8 17.8 22.5 19.5 20.8" 
          fill="none" 
          stroke="#E2DCC8" 
          strokeWidth="3.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {/* Minimalist Brand Accent Dot */}
        <circle cx="23.5" cy="20.5" r="2" fill="#00A651" />
      </svg>
    </div>
  );
};

export default AppIcon;
