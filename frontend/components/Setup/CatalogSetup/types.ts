import React from 'react';

export type LayoutId = 'table-3grid' | 'cards-2x2' | 'cards-3x3';

export interface LayoutOption {
  id: LayoutId;
  name: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  recommendedFor: string;
}

export interface TemplateElementsRendererProps {
  elements: any[];
  width?: number;
  height?: number;
  backgroundColor?: string;
  catalogTitle?: string;
  thumbnail?: string;
  className?: string;
}

export interface CardFieldsConfig {
  showPrice: boolean;
  showSku: boolean;
  showTitle: boolean;
  cardTheme: 'classic-stack' | 'editorial-overlay';
}

export interface PhaseInfo {
  num: number;
  label: string;
}
