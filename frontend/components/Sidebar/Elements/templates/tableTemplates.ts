import { CanvasElement } from '../../../../types';

export interface TableTemplate {
  id: string;
  title: string;
  category: 'outline' | 'header-fill' | 'zebra' | 'minimal';
  width: number;
  height: number;
  getSvg: () => string;
  getCanvasElements: (groupId: string) => CanvasElement[];
}

const createEmptyTable = (
  idPrefix: string,
  groupId: string,
  headerBg: string,
  headerTextColor: string,
  rowBg: string,
  alternateRowBg: string,
  borderColor: string,
  textColor: string = '#0F172A'
): CanvasElement[] => [
  {
    id: `tbl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: 'table',
    x: 60,
    y: 80,
    width: 460,
    height: 160,
    rotation: 0,
    opacity: 1,
    zIndex: 10,
    groupId,
    tableData: {
      headers: ['', '', ''],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      headerBg,
      headerTextColor,
      rowBg,
      alternateRowBg,
      borderColor,
      textColor,
      fontSize: 10,
      headerFontSize: 11,
      cellPadding: 8,
    },
  },
];

export const tableTemplates: TableTemplate[] = [
  // 1. Classic Outline Grid Table
  {
    id: 'table-outline',
    title: 'Outline Grid Table',
    category: 'outline',
    width: 460,
    height: 160,
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" width="100%" height="100%">
        <rect x="2" y="2" width="96" height="76" rx="2" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.5"/>
        <line x1="34" y1="2" x2="34" y2="78" stroke="#94A3B8" stroke-width="1.2"/>
        <line x1="66" y1="2" x2="66" y2="78" stroke="#94A3B8" stroke-width="1.2"/>
        <line x1="2" y1="22" x2="98" y2="22" stroke="#94A3B8" stroke-width="1.2"/>
        <line x1="2" y1="41" x2="98" y2="41" stroke="#94A3B8" stroke-width="1.2"/>
        <line x1="2" y1="60" x2="98" y2="60" stroke="#94A3B8" stroke-width="1.2"/>
      </svg>
    `,
    getCanvasElements: (groupId) =>
      createEmptyTable('outline', groupId, '#FFFFFF', '#0F172A', '#FFFFFF', '#FFFFFF', '#CBD5E1'),
  },

  // 2. Header Fill Table
  {
    id: 'table-header-fill',
    title: 'Header Fill Table',
    category: 'header-fill',
    width: 460,
    height: 160,
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" width="100%" height="100%">
        <rect x="2" y="2" width="96" height="76" rx="2" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
        <rect x="2" y="2" width="96" height="20" fill="#334155"/>
        <line x1="34" y1="2" x2="34" y2="78" stroke="#E2E8F0" stroke-width="1"/>
        <line x1="66" y1="2" x2="66" y2="78" stroke="#E2E8F0" stroke-width="1"/>
        <line x1="34" y1="2" x2="34" y2="22" stroke="#475569" stroke-width="1"/>
        <line x1="66" y1="2" x2="66" y2="22" stroke="#475569" stroke-width="1"/>
        <line x1="2" y1="41" x2="98" y2="41" stroke="#E2E8F0" stroke-width="1"/>
        <line x1="2" y1="60" x2="98" y2="60" stroke="#E2E8F0" stroke-width="1"/>
      </svg>
    `,
    getCanvasElements: (groupId) =>
      createEmptyTable('header-fill', groupId, '#334155', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#CBD5E1'),
  },

  // 3. Zebra Striped Table
  {
    id: 'table-zebra',
    title: 'Zebra Striped Table',
    category: 'zebra',
    width: 460,
    height: 160,
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" width="100%" height="100%">
        <rect x="2" y="2" width="96" height="76" rx="2" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
        <rect x="2" y="2" width="96" height="20" fill="#334155"/>
        <rect x="2" y="41" width="96" height="19" fill="#F1F5F9"/>
        <line x1="34" y1="2" x2="34" y2="78" stroke="#E2E8F0" stroke-width="1"/>
        <line x1="66" y1="2" x2="66" y2="78" stroke="#E2E8F0" stroke-width="1"/>
        <line x1="34" y1="2" x2="34" y2="22" stroke="#475569" stroke-width="1"/>
        <line x1="66" y1="2" x2="66" y2="22" stroke="#475569" stroke-width="1"/>
        <line x1="2" y1="41" x2="98" y2="41" stroke="#E2E8F0" stroke-width="1"/>
        <line x1="2" y1="60" x2="98" y2="60" stroke="#E2E8F0" stroke-width="1"/>
      </svg>
    `,
    getCanvasElements: (groupId) =>
      createEmptyTable('zebra', groupId, '#334155', '#FFFFFF', '#FFFFFF', '#F8FAFC', '#CBD5E1'),
  },

  // 4. Clean Minimalist Table
  {
    id: 'table-minimal',
    title: 'Minimalist Horizontal Lines Table',
    category: 'minimal',
    width: 460,
    height: 160,
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" width="100%" height="100%">
        <rect x="2" y="2" width="96" height="76" rx="2" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
        <rect x="2" y="2" width="96" height="20" fill="#F8FAFC"/>
        <line x1="2" y1="22" x2="98" y2="22" stroke="#94A3B8" stroke-width="1.5"/>
        <line x1="2" y1="41" x2="98" y2="41" stroke="#E2E8F0" stroke-width="1"/>
        <line x1="2" y1="60" x2="98" y2="60" stroke="#E2E8F0" stroke-width="1"/>
      </svg>
    `,
    getCanvasElements: (groupId) =>
      createEmptyTable('minimal', groupId, '#F1F5F9', '#0F172A', '#FFFFFF', '#FFFFFF', '#E2E8F0'),
  },
];

