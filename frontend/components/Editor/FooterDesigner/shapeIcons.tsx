import React from 'react';
import { ShapeType } from '../../../types';

export const FOOTER_SHAPES: { type: ShapeType; label: string; icon: React.ReactNode }[] = [
  {
    type: 'rect',
    label: 'Square',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <rect x="3" y="3" width="18" height="18" rx="1" />
      </svg>
    )
  },
  {
    type: 'roundedRect',
    label: 'Rounded',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <rect x="3" y="3" width="18" height="18" rx="5" />
      </svg>
    )
  },
  {
    type: 'circle',
    label: 'Circle',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <circle cx="12" cy="12" r="9" />
      </svg>
    )
  },
  {
    type: 'triangle',
    label: 'Triangle',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="12,3 21,20 3,20" />
      </svg>
    )
  },
  {
    type: 'triangleDown',
    label: 'Down Tri',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="3,4 21,4 12,21" />
      </svg>
    )
  },
  {
    type: 'diamond',
    label: 'Diamond',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="12,2 22,12 12,22 2,12" />
      </svg>
    )
  },
  {
    type: 'pentagon',
    label: 'Pentagon',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="12,2 22,9 18,22 6,22 2,9" />
      </svg>
    )
  },
  {
    type: 'hexagon',
    label: 'Hexagon',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
      </svg>
    )
  },
  {
    type: 'octagon',
    label: 'Octagon',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="8,2 16,2 22,8 22,16 16,22 8,22 2,16 2,8" />
      </svg>
    )
  },
  {
    type: 'star',
    label: 'Star',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />
      </svg>
    )
  },
  {
    type: 'arrow',
    label: 'Arrow',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="3,9 14,9 14,4 22,12 14,20 14,15 3,15" />
      </svg>
    )
  },
  {
    type: 'arrow4',
    label: 'Double Arrow',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="2,12 8,6 8,10 16,10 16,6 22,12 16,18 16,14 8,14 8,18" />
      </svg>
    )
  },
  {
    type: 'cross',
    label: 'Cross',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="9,2 15,2 15,9 22,9 22,15 15,15 15,22 9,22 9,15 2,15 2,9 9,9" />
      </svg>
    )
  },
  {
    type: 'pill',
    label: 'Pill',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <rect x="2" y="5" width="20" height="14" rx="7" />
      </svg>
    )
  },
  {
    type: 'parallelogram',
    label: 'Parallelogram',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <polygon points="7,4 22,4 17,20 2,20" />
      </svg>
    )
  },
  {
    type: 'line',
    label: 'Divider Line',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  },
  {
    type: 'curved-line',
    label: 'Curved Line',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <path d="M 3 17 C 8 7, 16 21, 21 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="3" cy="17" r="2.5" fill="currentColor" />
        <circle cx="21" cy="7" r="2.5" fill="currentColor" />
      </svg>
    )
  },
  {
    type: 'elbow-line',
    label: 'Elbow Line',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <path d="M 3 18 H 12 V 6 H 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="3" cy="18" r="2.5" fill="currentColor" />
        <circle cx="21" cy="6" r="2.5" fill="currentColor" />
      </svg>
    )
  }
];
