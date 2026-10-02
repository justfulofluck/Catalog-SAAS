import { Table, LayoutGrid, Grid } from 'lucide-react';
import { LayoutOption, PhaseInfo } from './types';

export const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'table-3grid',
    name: '3-Grid Spec Table',
    badge: 'Technical & B2B',
    description: 'Category Header + Product Photo + Specification Table per section. 3 balanced sections per page.',
    icon: Table,
    recommendedFor: 'Machinery, Hardware, Electrical, Tiles, Industrial & Auto Parts'
  },
  {
    id: 'cards-2x2',
    name: 'Modern Product Cards (2x2)',
    badge: 'Visual Showcase',
    description: '4 spacious showcase cards per page with prominent photo, price tag, SKU, and key highlights.',
    icon: LayoutGrid,
    recommendedFor: 'Fashion, Furniture, Electronics, Retail & FMCG Goods'
  },
  {
    id: 'cards-3x3',
    name: 'Compact Grid Cards (3x3)',
    badge: 'High-Density Catalog',
    description: '9 clean, compact cards per page for broad product selection and rapid visual browsing.',
    icon: Grid,
    recommendedFor: 'Accessories, Jewelry, Spare Components & Wholesale'
  }
];

export const PHASES: PhaseInfo[] = [
  { num: 1, label: 'Identity' },
  { num: 2, label: 'Categories' },
  { num: 3, label: 'Layouts' },
  { num: 4, label: 'Framing & Covers' },
  { num: 5, label: 'Schema Setup' }
];

export const DEFAULT_HEADERS: string[] = [
  'MODEL NO',
  'PRODUCTS',
  'PRICE',
  'CUT-OUT',
  'COLOR'
];

export const STANDARD_CANDIDATE_FIELDS: string[] = [
  'MODEL NO',
  'PRODUCTS',
  'PRICE',
  'CUT-OUT',
  'COLOR',
  'PACKING',
  'DEALER PRICE',
  'PACKING PER BOX'
];
