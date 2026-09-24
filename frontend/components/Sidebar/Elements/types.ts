import { CanvasElement } from '../../../types';

export interface ElementCategoryItem {
  id: string;
  title: string;
  category: 'basic' | 'interactive' | 'decorative';
  description: string;
  badge?: string;
  previewType: string;
}

export interface TextBlockTemplate {
  id: string;
  title: string;
  width: number;
  height: number;
  getSvg: () => string;
  getCanvasElements: (groupId: string) => CanvasElement[];
}

export interface ChecklistTemplate {
  id: string;
  title: string;
  width: number;
  height: number;
  getSvg: () => string;
  getCanvasElements: (groupId: string) => CanvasElement[];
}
