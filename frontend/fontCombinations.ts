export interface ComboElement {
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle?: 'normal' | 'italic';
  fill: string;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  textDecoration?: string;
  height?: number;
  width?: number;
  offsetY: number;
  effectStyle?: 'none' | 'outline' | 'shadow' | 'neon';
  effectColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  textStrokeWidth?: number;
}

export interface FontCombination {
  id: string;
  name: string;
  category: string;
  elements: ComboElement[];
}

export const FONT_COMBINATIONS: FontCombination[] = [
  // 1. Happy BIRTHDAY
  {
    id: 'happy-birthday-duo',
    name: 'Happy Birthday',
    category: 'Celebration',
    elements: [
      { text: 'Happy', fontSize: 44, fontFamily: 'Dancing Script', fontWeight: '700', fill: '#ffffff', offsetY: 0, width: 320, height: 50 },
      { text: 'BIRTHDAY', fontSize: 36, fontFamily: 'Montserrat', fontWeight: '900', letterSpacing: 2, fill: '#ffffff', offsetY: 40, width: 360, height: 45 },
    ]
  },

  // 2. GOLDEN HOUR
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    category: 'Luxury & Fashion',
    elements: [
      { text: 'GOLDEN', fontSize: 38, fontFamily: 'Playfair Display', fontWeight: '700', letterSpacing: 4, fill: '#eab308', offsetY: 0, width: 360, height: 46 },
      { text: 'HOUR', fontSize: 38, fontFamily: 'Playfair Display', fontWeight: '700', letterSpacing: 6, fill: '#eab308', offsetY: 40, width: 360, height: 46 },
    ]
  },

  // 3. Thank you! (Retro 3D Script)
  {
    id: 'thank-you-retro',
    name: 'Thank You Retro',
    category: 'Greetings',
    elements: [
      {
        text: 'Thank you!',
        fontSize: 50,
        fontFamily: 'Shrikhand',
        fontWeight: '400',
        fill: '#fef3c7',
        effectStyle: 'shadow',
        effectColor: '#ef4444',
        shadowOffsetX: 4,
        shadowOffsetY: 4,
        shadowBlur: 0,
        offsetY: 0,
        width: 380,
        height: 65,
      }
    ]
  },

  // 4. Happy birthday! (Coral Brush)
  {
    id: 'happy-birthday-coral',
    name: 'Happy Birthday Brush',
    category: 'Celebration',
    elements: [
      { text: 'Happy', fontSize: 40, fontFamily: 'Kaushan Script', fontWeight: '700', fill: '#f87171', offsetY: 0, width: 320, height: 46 },
      { text: 'birthday!', fontSize: 40, fontFamily: 'Kaushan Script', fontWeight: '700', fill: '#f87171', offsetY: 36, width: 340, height: 46 },
    ]
  },

  // 5. GLOW (Neon Pink)
  {
    id: 'glow-neon',
    name: 'Neon Glow',
    category: 'Neon & Effects',
    elements: [
      {
        text: 'GLOW',
        fontSize: 60,
        fontFamily: 'Anton',
        fontWeight: '900',
        fill: '#f43f5e',
        effectStyle: 'neon',
        effectColor: '#fb7185',
        shadowBlur: 16,
        offsetY: 0,
        width: 320,
        height: 70,
      }
    ]
  },

  // 6. THANK YOU (Varsity)
  {
    id: 'thank-you-varsity',
    name: 'Thank You Varsity',
    category: 'Greetings',
    elements: [
      { text: 'THANK', fontSize: 16, fontFamily: 'Montserrat', fontWeight: '900', letterSpacing: 8, fill: '#f43f5e', offsetY: 0, width: 300, height: 22 },
      { text: 'YOU', fontSize: 52, fontFamily: 'Alfa Slab One', fontWeight: '400', letterSpacing: 2, fill: '#f43f5e', offsetY: 20, width: 320, height: 60 },
    ]
  },

  // 7. LIKE & SUBSCRIBE
  {
    id: 'like-subscribe',
    name: 'Like & Subscribe',
    category: 'Social Media',
    elements: [
      {
        text: 'LIKE &',
        fontSize: 42,
        fontFamily: 'Righteous',
        fontWeight: '400',
        fill: '#facc15',
        effectStyle: 'shadow',
        effectColor: '#b91c1c',
        shadowOffsetX: 3,
        shadowOffsetY: 3,
        offsetY: 0,
        width: 340,
        height: 50,
      },
      {
        text: 'SUBSCRIBE',
        fontSize: 32,
        fontFamily: 'Righteous',
        fontWeight: '400',
        fill: '#facc15',
        effectStyle: 'shadow',
        effectColor: '#b91c1c',
        shadowOffsetX: 3,
        shadowOffsetY: 3,
        offsetY: 42,
        width: 360,
        height: 44,
      }
    ]
  },

  // 8. charlie & katie are engaged!
  {
    id: 'charlie-katie-engaged',
    name: 'Engagement Announcement',
    category: 'Wedding & Events',
    elements: [
      { text: 'charlie & katie are', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', fill: '#94a3b8', letterSpacing: 1.5, offsetY: 0, width: 320, height: 20 },
      { text: 'engaged!', fontSize: 44, fontFamily: 'Alex Brush', fontWeight: '400', fill: '#ffffff', offsetY: 18, width: 340, height: 50 },
    ]
  },

  // 9. Sparkle (Gold Neon)
  {
    id: 'sparkle-gold',
    name: 'Sparkle Neon',
    category: 'Neon & Effects',
    elements: [
      {
        text: 'Sparkle',
        fontSize: 52,
        fontFamily: 'Yellowtail',
        fontWeight: '400',
        fill: '#fef08a',
        effectStyle: 'neon',
        effectColor: '#eab308',
        shadowBlur: 16,
        offsetY: 0,
        width: 320,
        height: 65,
      }
    ]
  },

  // 10. TATTOO studio
  {
    id: 'tattoo-studio',
    name: 'Tattoo Studio',
    category: 'Vintage & Gothic',
    elements: [
      { text: 'TATTOO', fontSize: 48, fontFamily: 'Pirata One', fontWeight: '400', fill: '#e4e4e7', letterSpacing: 3, offsetY: 0, width: 340, height: 55 },
      { text: 'studio', fontSize: 30, fontFamily: 'Herr Von Muellerhoff', fontWeight: '400', fill: '#a1a1aa', offsetY: 36, width: 280, height: 40 },
    ]
  },

  // 11. TALK TO US
  {
    id: 'talk-to-us',
    name: 'Talk To Us',
    category: 'Business & Contact',
    elements: [
      { text: 'TALK TO US', fontSize: 22, fontFamily: 'Montserrat', fontWeight: '900', letterSpacing: 2, fill: '#ffffff', offsetY: 0, width: 320, height: 30 },
      { text: '(04) 298 3985 2092\n+76 209 1092 4095\ninfo@mollysrestaurant.com', fontSize: 11, fontFamily: 'Inter', fontWeight: '400', fill: '#cbd5e1', lineHeight: 1.5, offsetY: 30, width: 320, height: 55 },
    ]
  },

  // 12. LEVEL UP (Cyberpunk Neon)
  {
    id: 'level-up',
    name: 'Level Up',
    category: 'Gaming & Cyberpunk',
    elements: [
      {
        text: 'LEVEL',
        fontSize: 38,
        fontFamily: 'Orbitron',
        fontWeight: '900',
        letterSpacing: 2,
        fill: '#38bdf8',
        effectStyle: 'neon',
        effectColor: '#0ea5e9',
        shadowBlur: 14,
        offsetY: 0,
        width: 320,
        height: 48,
      },
      {
        text: 'UP',
        fontSize: 48,
        fontFamily: 'Orbitron',
        fontWeight: '900',
        letterSpacing: 3,
        fill: '#c084fc',
        effectStyle: 'neon',
        effectColor: '#a855f7',
        shadowBlur: 14,
        offsetY: 42,
        width: 320,
        height: 56,
      }
    ]
  },

  // 13. HUGE SALE
  {
    id: 'huge-sale',
    name: 'Huge Sale',
    category: 'Sales & Promotions',
    elements: [
      { text: 'HUGE', fontSize: 56, fontFamily: 'Anton', fontWeight: '900', fill: '#eab308', letterSpacing: 1, offsetY: 0, width: 340, height: 60 },
      { text: 'SALE', fontSize: 52, fontFamily: 'Anton', fontWeight: '900', fill: 'transparent', effectStyle: 'outline', effectColor: '#eab308', textStrokeWidth: 2, letterSpacing: 2, offsetY: 50, width: 340, height: 60 },
    ]
  },

  // 14. shares are appreciated!
  {
    id: 'shares-appreciated',
    name: 'Shares Appreciated',
    category: 'Social Media',
    elements: [
      { text: 'shares are appreciated!', fontSize: 15, fontFamily: 'Special Elite', fontWeight: '400', fill: '#84cc16', letterSpacing: 1.5, offsetY: 0, width: 340, height: 26 }
    ]
  },

  // 15. 1,286 NEW DOCUMENTS
  {
    id: 'documents-stats',
    name: 'Infographic Stats',
    category: 'Corporate & Stats',
    elements: [
      { text: 'NOVEMBER 2019', fontSize: 10, fontFamily: 'Inter', fontWeight: '800', letterSpacing: 3, fill: '#94a3b8', offsetY: 0, width: 320, height: 18 },
      { text: '1,286', fontSize: 72, fontFamily: 'Bebas Neue', fontWeight: '400', fill: '#ffffff', offsetY: 14, width: 320, height: 75 },
      { text: 'NEW DOCUMENTS CREATED', fontSize: 11, fontFamily: 'Montserrat', fontWeight: '900', fill: '#ffffff', letterSpacing: 1.5, offsetY: 84, width: 320, height: 20 },
    ]
  },

  // 16. EST. 2012 DAPPER
  {
    id: 'dapper-est-2012',
    name: 'Dapper Heritage',
    category: 'Fashion & Luxury',
    elements: [
      { text: 'EST. 2012', fontSize: 11, fontFamily: 'Cinzel', fontWeight: '700', letterSpacing: 4, fill: '#cbd5e1', offsetY: 0, width: 320, height: 18 },
      { text: 'DAPPER', fontSize: 40, fontFamily: 'Cinzel', fontWeight: '900', letterSpacing: 3, fill: '#ffffff', offsetY: 18, width: 340, height: 48 },
      { text: 'Premium Quality Goods', fontSize: 12, fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: '400', fill: '#94a3b8', letterSpacing: 1, offsetY: 58, width: 320, height: 20 },
    ]
  },

  // 17. PLAY (3D Arcade)
  {
    id: 'play-arcade',
    name: 'Play 3D Gaming',
    category: 'Gaming & Cyberpunk',
    elements: [
      {
        text: 'PLAY',
        fontSize: 60,
        fontFamily: 'Righteous',
        fontWeight: '400',
        fill: '#c084fc',
        effectStyle: 'shadow',
        effectColor: '#06b6d4',
        shadowOffsetX: 5,
        shadowOffsetY: 5,
        shadowBlur: 0,
        offsetY: 0,
        width: 340,
        height: 70,
      }
    ]
  },

  // 18. LIKE & FOLLOW for more
  {
    id: 'like-follow-more',
    name: 'Like & Follow',
    category: 'Social Media',
    elements: [
      { text: 'LIKE', fontSize: 32, fontFamily: 'Cinzel', fontWeight: '700', letterSpacing: 3, fill: '#fef3c7', offsetY: 0, width: 320, height: 38 },
      { text: '&', fontSize: 34, fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: '700', fill: '#fef3c7', offsetY: 28, width: 320, height: 38 },
      { text: 'FOLLOW', fontSize: 32, fontFamily: 'Cinzel', fontWeight: '700', letterSpacing: 3, fill: '#fef3c7', offsetY: 60, width: 320, height: 38 },
      { text: 'for more', fontSize: 13, fontFamily: 'Courier Prime', fontWeight: '400', fill: '#94a3b8', letterSpacing: 2, offsetY: 94, width: 320, height: 20 },
    ]
  },

  // 19. Wild SALE UP TO 50% OFF!
  {
    id: 'wild-sale',
    name: 'Wild Sale',
    category: 'Sales & Promotions',
    elements: [
      { text: 'Wild', fontSize: 44, fontFamily: 'Caveat', fontWeight: '700', fill: '#ffffff', offsetY: 0, width: 320, height: 48 },
      { text: 'SALE', fontSize: 48, fontFamily: 'Anton', fontWeight: '900', fill: 'transparent', effectStyle: 'outline', effectColor: '#ffffff', textStrokeWidth: 2, letterSpacing: 2, offsetY: 34, width: 340, height: 55 },
      { text: 'UP TO 50% OFF!', fontSize: 11, fontFamily: 'Montserrat', fontWeight: '900', letterSpacing: 3, fill: '#ffffff', offsetY: 84, width: 320, height: 20 },
    ]
  },

  // 20. JOIN NOW
  {
    id: 'join-now',
    name: 'Join Now',
    category: 'Call to Action',
    elements: [
      { text: 'JOIN', fontSize: 72, fontFamily: 'Anton', fontWeight: '900', fill: '#c084fc', letterSpacing: 1, offsetY: 0, width: 340, height: 75 },
      { text: 'NOW', fontSize: 36, fontFamily: 'Montserrat', fontWeight: '900', fill: '#ffffff', letterSpacing: 3, offsetY: 24, width: 340, height: 45 },
    ]
  },

  // 21. Sweet (Hot Pink Neon)
  {
    id: 'sweet-neon',
    name: 'Sweet Neon Script',
    category: 'Neon & Effects',
    elements: [
      {
        text: 'Sweet',
        fontSize: 54,
        fontFamily: 'Pacifico',
        fontWeight: '400',
        fill: '#f43f5e',
        effectStyle: 'neon',
        effectColor: '#fb7185',
        shadowBlur: 16,
        offsetY: 0,
        width: 320,
        height: 65,
      }
    ]
  },

  // 22. Content that CLICKS
  {
    id: 'content-clicks',
    name: 'Content That Clicks',
    category: 'Business & Marketing',
    elements: [
      { text: 'Content that', fontSize: 18, fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: '600', fill: '#cbd5e1', offsetY: 0, width: 320, height: 26 },
      { text: 'CLICKS', fontSize: 40, fontFamily: 'Montserrat', fontWeight: '900', fill: '#06b6d4', letterSpacing: 2, offsetY: 22, width: 340, height: 50 },
    ]
  },

  // 23. Spring COLLECTION
  {
    id: 'spring-collection',
    name: 'Spring Collection',
    category: 'Fashion & Luxury',
    elements: [
      { text: 'Spring', fontSize: 48, fontFamily: 'Shrikhand', fontWeight: '400', fill: '#34d399', offsetY: 0, width: 340, height: 58 },
      { text: 'COLLECTION', fontSize: 14, fontFamily: 'Cinzel', fontWeight: '900', letterSpacing: 4, fill: '#064e3b', offsetY: 46, width: 320, height: 22 },
    ]
  },

  // 24. HUSTLE
  {
    id: 'hustle-sport',
    name: 'Hustle Athletic',
    category: 'Sports & Fitness',
    elements: [
      {
        text: 'HUSTLE',
        fontSize: 54,
        fontFamily: 'Oswald',
        fontWeight: '700',
        fontStyle: 'italic',
        fill: 'transparent',
        effectStyle: 'outline',
        effectColor: '#84cc16',
        textStrokeWidth: 2,
        letterSpacing: 2,
        offsetY: 0,
        width: 340,
        height: 60,
      }
    ]
  },

  // 25. Elizabeth and Richard (Wedding)
  {
    id: 'elizabeth-richard',
    name: 'Formal Wedding Invitation',
    category: 'Wedding & Events',
    elements: [
      { text: 'ANNOUNCING THE MARRIAGE OF', fontSize: 9, fontFamily: 'Cinzel', fontWeight: '700', letterSpacing: 2, fill: '#cbd5e1', offsetY: 0, width: 320, height: 16 },
      { text: 'Elizabeth and Richard', fontSize: 26, fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: '700', fill: '#ffffff', offsetY: 18, width: 340, height: 38 },
      { text: 'FOURTH OF NOVEMBER, TWENTY NINETEEN', fontSize: 8, fontFamily: 'Cinzel', fontWeight: '700', letterSpacing: 1.5, fill: '#94a3b8', offsetY: 56, width: 320, height: 16 },
    ]
  },

  // 26. YOU'RE WELCOME
  {
    id: 'youre-welcome',
    name: "You're Welcome 3D",
    category: 'Retro & Pop',
    elements: [
      {
        text: "YOU'RE",
        fontSize: 36,
        fontFamily: 'Righteous',
        fontWeight: '400',
        fill: '#f97316',
        effectStyle: 'shadow',
        effectColor: '#ea580c',
        shadowOffsetX: 3,
        shadowOffsetY: 3,
        offsetY: 0,
        width: 320,
        height: 44,
      },
      {
        text: 'WELCOME',
        fontSize: 36,
        fontFamily: 'Righteous',
        fontWeight: '400',
        fill: '#ec4899',
        effectStyle: 'shadow',
        effectColor: '#db2777',
        shadowOffsetX: 3,
        shadowOffsetY: 3,
        offsetY: 36,
        width: 340,
        height: 44,
      }
    ]
  },

  // 27. please rate us ★★★★★
  {
    id: 'please-rate-us',
    name: 'Rate Us Stars',
    category: 'Reviews & Feedback',
    elements: [
      { text: 'please\nrate us', fontSize: 30, fontFamily: 'Fredoka', fontWeight: '700', fill: '#3b82f6', lineHeight: 1.0, offsetY: 0, width: 300, height: 60 },
      { text: '★★★★★', fontSize: 18, fontFamily: 'Inter', fontWeight: '900', fill: '#22c55e', letterSpacing: 4, offsetY: 64, width: 300, height: 25 },
    ]
  },

  // 28. lovely (Puffy Bubble Sticker)
  {
    id: 'lovely-bubble',
    name: 'Lovely Bubble Sticker',
    category: 'Retro & Pop',
    elements: [
      {
        text: 'lovely',
        fontSize: 54,
        fontFamily: 'Sniglet',
        fontWeight: '800',
        fill: '#f43f5e',
        effectStyle: 'outline',
        effectColor: '#ffffff',
        textStrokeWidth: 3,
        offsetY: 0,
        width: 320,
        height: 65,
      }
    ]
  },

  // 29. HEADING Paragraph
  {
    id: 'heading-paragraph',
    name: 'Classic Editorial Layout',
    category: 'Headings & Titles',
    elements: [
      { text: 'HEADING', fontSize: 32, fontFamily: 'Montserrat', fontStyle: 'italic', fontWeight: '900', fill: '#ffffff', letterSpacing: 1.5, offsetY: 0, width: 320, height: 40 },
      { text: 'Paragraph text to describe the modern features and collection details.', fontSize: 13, fontFamily: 'Inter', fontWeight: '400', fill: '#94a3b8', lineHeight: 1.4, offsetY: 38, width: 320, height: 45 },
    ]
  },

  // 30. FREE DELIVERY
  {
    id: 'free-delivery',
    name: 'Free Delivery Punch',
    category: 'Sales & Badges',
    elements: [
      { text: 'FREE', fontSize: 44, fontFamily: 'Anton', fontStyle: 'italic', fontWeight: '900', fill: '#38bdf8', letterSpacing: 1, offsetY: 0, width: 320, height: 50 },
      { text: 'DELIVERY', fontSize: 44, fontFamily: 'Anton', fontStyle: 'italic', fontWeight: '900', fill: '#f43f5e', letterSpacing: 1, offsetY: 40, width: 340, height: 50 },
    ]
  },

  // 31. Original Red Wine
  {
    id: 'red-wine-vintage',
    name: 'Vintage Wine Label',
    category: 'Food & Beverage',
    elements: [
      { text: 'EST. 1989\nColle Colleen', fontSize: 9, fontFamily: 'Cinzel', fontWeight: '700', fill: '#cbd5e1', letterSpacing: 1, lineHeight: 1.3, offsetY: 0, width: 300, height: 26 },
      { text: 'Original Red Wine', fontSize: 24, fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: '700', fill: '#ffffff', offsetY: 26, width: 320, height: 35 },
      { text: 'The Vineyard • 2005', fontSize: 8, fontFamily: 'Cinzel', fontWeight: '700', fill: '#94a3b8', letterSpacing: 1.5, offsetY: 58, width: 300, height: 16 },
    ]
  },

  // 32. Certificate of Completion
  {
    id: 'certificate-completion',
    name: 'Award Certificate',
    category: 'Diplomas & Awards',
    elements: [
      { text: 'Certificate of\nCompletion', fontSize: 22, fontFamily: 'Cinzel', fontWeight: '700', fill: '#ffffff', letterSpacing: 1.5, lineHeight: 1.2, offsetY: 0, width: 320, height: 52 },
      { text: 'is awarded to', fontSize: 12, fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: '400', fill: '#94a3b8', offsetY: 52, width: 300, height: 20 },
    ]
  }
];
