
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

const DefaultProps = {
  size: 24,
  color: 'currentColor',
  strokeWidth: 2,
};

export const RecommendationIcon: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => {
  const s = size || DefaultProps.size;
  const sw = strokeWidth || DefaultProps.strokeWidth;
  return (
    <svg 
      width={s} height={s} viewBox="0 0 24 24" fill="none" 
      stroke={color || DefaultProps.color} strokeWidth={sw} 
      strokeLinecap="round" strokeLinejoin="round" {...props}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
      <circle cx="16" cy="17" r="2" />
      <path d="m18 19 2 2" />
    </svg>
  );
};

export const DeletionIcon: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => {
  const s = size || DefaultProps.size;
  const sw = strokeWidth || DefaultProps.strokeWidth;
  return (
    <svg 
      width={s} height={s} viewBox="0 0 24 24" fill="none" 
      stroke={color || DefaultProps.color} strokeWidth={sw} 
      strokeLinecap="round" strokeLinejoin="round" {...props}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
      <path d="M10 11l4 6" opacity="0.3" />
      <path d="M14 11l-4 6" opacity="0.3" />
    </svg>
  );
};

export const LogoIcon: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => {
  const s = size || DefaultProps.size;
  const sw = strokeWidth || DefaultProps.strokeWidth;
  const c = color || DefaultProps.color;
  
  return (
    <svg 
      width={s} height={s} viewBox="0 0 24 24" fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Outer Hexagon Shield */}
      <path 
        d="M12 2L20.5 7V17L12 22L3.5 17V7L12 2Z" 
        stroke={c} 
        strokeWidth={sw} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Inner Lightning Bolt Core */}
      <path 
        d="M13 7L8 14H12L11 18L16 11H12L13 7Z" 
        fill={c}
      />
      {/* Decorative Data Nodes */}
      <circle cx="12" cy="3.5" r="1" fill={c} opacity="0.5" />
      <circle cx="19" cy="17.5" r="1" fill={c} opacity="0.5" />
      <circle cx="5" cy="17.5" r="1" fill={c} opacity="0.5" />
    </svg>
  );
};

export const PreviewIcon: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => {
  const s = size || DefaultProps.size;
  const sw = strokeWidth || DefaultProps.strokeWidth;
  return (
    <svg 
      width={s} height={s} viewBox="0 0 24 24" fill="none" 
      stroke={color || DefaultProps.color} strokeWidth={sw} 
      strokeLinecap="round" strokeLinejoin="round" {...props}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" opacity="0.2" />
      <path d="M20 4L15 9" opacity="0.4" />
      <circle cx="21" cy="3" r="1" opacity="0.4" />
    </svg>
  );
};
