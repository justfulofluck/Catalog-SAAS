export const PRESET_TITLE_COLORS = ['#00a651', '#0F3D3E', '#E2DCC8', '#38bdf8', '#f59e0b', '#dc2626'];

export const PRESET_THEME_PALETTES = [
  { name: 'Emerald Forest', headerBg: '#0F3D3E', headerText: '#E2DCC8', titleColor: '#00a651', border: '#0F3D3E' },
  { name: 'Navy Modern', headerBg: '#002b36', headerText: '#ffffff', titleColor: '#38bdf8', border: '#002b36' },
  { name: 'Dark Slate', headerBg: '#1e293b', headerText: '#f8fafc', titleColor: '#94a3b8', border: '#334155' },
  { name: 'Warm Amber', headerBg: '#78350f', headerText: '#fef3c7', titleColor: '#d97706', border: '#78350f' },
  { name: 'Classic Crimson', headerBg: '#881337', headerText: '#ffe4e6', titleColor: '#e11d48', border: '#881337' }
];

export const isDarkColor = (color: string): boolean => {
  if (!color || color === 'transparent') return false;
  let hex = color.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length !== 6) return false;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};
