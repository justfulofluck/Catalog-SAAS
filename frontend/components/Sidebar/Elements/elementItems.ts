import { ElementCategoryItem } from './types';

export const ELEMENT_ITEMS: ElementCategoryItem[] = [
  // Basic elements
  {
    id: 'text-blocks',
    title: 'Text blocks',
    category: 'basic',
    description: 'Headlines, deals, quote banners and stylized typographic blocks',
    previewType: 'text-block',
  },
  {
    id: 'lists',
    title: 'Lists',
    category: 'basic',
    description: 'Numbered steps, badge points, and icon feature rows',
    previewType: 'lists',
  },
  {
    id: 'image-frames',
    title: 'Image frames',
    category: 'basic',
    description: 'Circular masks, polaroids, organic curves, and photo cutouts',
    previewType: 'image-frames',
  },
  {
    id: 'smart-visuals',
    title: 'Smart Visuals',
    category: 'basic',
    description: 'Process arrows, chevrons, comparison charts, and timelines',
    previewType: 'smart-visuals',
  },
  {
    id: 'image-grids',
    title: 'Image grids',
    category: 'basic',
    description: 'Diamond collages, split matrices, and mosaic galleries',
    previewType: 'image-grids',
  },

  // Interactive elements
  {
    id: 'qr-code',
    title: 'QR code',
    category: 'interactive',
    description: 'Custom scannable QR codes for links, products, and contact info',
    badge: 'Popular',
    previewType: 'qr-code',
  },
  {
    id: 'checklist',
    title: 'Checklist',
    category: 'interactive',
    description: 'Tick-box specs, feature comparisons, and verification matrices',
    previewType: 'checklist',
  },
  {
    id: 'video-embed',
    title: 'Video embed',
    category: 'interactive',
    description: 'Playable video cards, YouTube/Vimeo links, and video mockups',
    previewType: 'video-embed',
  },
  {
    id: 'gif',
    title: 'GIF',
    category: 'interactive',
    description: 'Animated stickers, looping product shots, and motion assets',
    previewType: 'gif',
  },
  {
    id: 'callouts',
    title: 'Callouts & Quotes',
    category: 'interactive',
    description: 'Speech bubbles, highlights, testimonial boxes, and alert tags',
    previewType: 'callouts',
  },
  {
    id: 'badges',
    title: 'Badges & Ribbons',
    category: 'decorative',
    description: 'Discount seals, verified stamps, warranty tags, and sale ribbons',
    previewType: 'badges',
  },
];
