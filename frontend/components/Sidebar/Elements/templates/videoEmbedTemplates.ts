import { VideoEmbedTemplate } from '../types';

export const videoEmbedTemplates: VideoEmbedTemplate[] = [
  // 1. Standard 16:9 Video Player Card
  {
    id: 'video-card-standard',
    title: 'Modern 16:9 Video Player',
    width: 480,
    height: 270,
    category: 'standard',
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270" width="100%" height="auto">
        <defs>
          <linearGradient id="vBg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#18181b"/>
            <stop offset="100%" stop-color="#09090b"/>
          </linearGradient>
          <linearGradient id="btnG1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#10B981"/>
            <stop offset="100%" stop-color="#059669"/>
          </linearGradient>
          <filter id="shadow1" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.6"/>
          </filter>
        </defs>
        <rect width="480" height="270" rx="12" fill="url(#vBg1)" stroke="#27272a" stroke-width="2"/>
        
        <!-- Video Grid Pattern -->
        <circle cx="240" cy="135" r="90" fill="#10B981" opacity="0.05"/>
        <line x1="0" y1="90" x2="480" y2="90" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>
        <line x1="0" y1="180" x2="480" y2="180" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>
        <line x1="160" y1="0" x2="160" y2="270" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>
        <line x1="320" y1="0" x2="320" y2="270" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>

        <!-- Top Header Overlay -->
        <rect x="16" y="16" width="60" height="22" rx="4" fill="#000000" fill-opacity="0.6"/>
        <text x="46" y="31" font-family="Inter, sans-serif" font-size="10" font-weight="800" fill="#10B981" text-anchor="middle" letter-spacing="0.5">4K UHD</text>

        <!-- Center Play Button -->
        <g filter="url(#shadow1)">
          <circle cx="240" cy="135" r="32" fill="url(#btnG1)"/>
          <circle cx="240" cy="135" r="38" fill="none" stroke="#10B981" stroke-width="2" stroke-opacity="0.4"/>
          <polygon points="234,121 254,135 234,149" fill="#ffffff"/>
        </g>

        <!-- Bottom Controls Bar Preview -->
        <rect x="16" y="222" width="448" height="32" rx="6" fill="#000000" fill-opacity="0.75"/>
        <polygon points="32,233 42,238 32,243" fill="#10B981"/>
        <rect x="52" y="236" width="310" height="4" rx="2" fill="#3f3f46"/>
        <rect x="52" y="236" width="110" height="4" rx="2" fill="#10B981"/>
        <circle cx="162" cy="238" r="4" fill="#ffffff"/>
        <text x="375" y="242" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#a1a1aa">03:45 / 08:20</text>
        <rect x="440" y="233" width="10" height="10" rx="1" fill="none" stroke="#a1a1aa" stroke-width="1.5"/>
      </svg>
    `,
    getCanvasElements: (groupId, videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ') => [
      // Base player background
      {
        id: `el-vid-bg-${Date.now()}-1`,
        type: 'shape',
        shapeType: 'roundedRect',
        fill: '#18181b',
        stroke: '#27272a',
        strokeWidth: 2,
        borderRadius: 12,
        x: 0,
        y: 0,
        width: 480,
        height: 270,
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      // Top badge
      {
        id: `el-vid-badge-${Date.now()}-2`,
        type: 'shape',
        shapeType: 'roundedRect',
        fill: '#000000',
        borderRadius: 4,
        x: 16,
        y: 16,
        width: 64,
        height: 22,
        rotation: 0,
        opacity: 0.8,
        zIndex: 2,
        groupId,
      },
      {
        id: `el-vid-badgetxt-${Date.now()}-3`,
        type: 'text',
        text: '4K UHD',
        fontFamily: 'Inter',
        fontSize: 10,
        fontWeight: 'bold',
        fill: '#10B981',
        textAlign: 'center',
        x: 16,
        y: 20,
        width: 64,
        height: 16,
        rotation: 0,
        opacity: 1,
        zIndex: 3,
        groupId,
      },
      // Center Play Button Circle
      {
        id: `el-vid-btn-${Date.now()}-4`,
        type: 'shape',
        shapeType: 'circle',
        fill: '#10B981',
        stroke: '#059669',
        strokeWidth: 2,
        x: 208,
        y: 103,
        width: 64,
        height: 64,
        rotation: 0,
        opacity: 1,
        zIndex: 4,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      // Play Icon Triangle
      {
        id: `el-vid-icon-${Date.now()}-5`,
        type: 'shape',
        shapeType: 'rightTriangle',
        fill: '#ffffff',
        x: 232,
        y: 122,
        width: 22,
        height: 26,
        rotation: 90,
        opacity: 1,
        zIndex: 5,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      // Bottom Bar
      {
        id: `el-vid-bar-${Date.now()}-6`,
        type: 'shape',
        shapeType: 'roundedRect',
        fill: '#09090b',
        borderRadius: 6,
        x: 16,
        y: 224,
        width: 448,
        height: 30,
        rotation: 0,
        opacity: 0.85,
        zIndex: 6,
        groupId,
      },
      {
        id: `el-vid-time-${Date.now()}-7`,
        type: 'text',
        text: '▶  03:45 / 08:20  •  Click to Play Video',
        fontFamily: 'Inter',
        fontSize: 11,
        fontWeight: 'bold',
        fill: '#E2DCC8',
        textAlign: 'left',
        x: 28,
        y: 231,
        width: 420,
        height: 18,
        rotation: 0,
        opacity: 0.9,
        zIndex: 7,
        groupId,
      },
    ],
  },

  // 2. Device Mockup - Laptop / MacBook Player
  {
    id: 'video-device-laptop',
    title: 'MacBook Laptop Mockup',
    width: 480,
    height: 310,
    category: 'mockup',
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 310" width="100%" height="auto">
        <!-- Laptop Lid -->
        <rect x="55" y="20" width="370" height="230" rx="14" fill="#27272a" stroke="#3f3f46" stroke-width="2"/>
        <circle cx="240" cy="28" r="3" fill="#18181b"/>
        
        <!-- Screen Content -->
        <rect x="68" y="38" width="344" height="200" rx="4" fill="#09090b"/>
        
        <!-- Screen Thumbnail Visual -->
        <circle cx="240" cy="138" r="60" fill="#0F3D3E" opacity="0.4"/>
        <rect x="80" y="50" width="80" height="18" rx="3" fill="#10B981" fill-opacity="0.2"/>
        <text x="120" y="63" font-family="Inter, sans-serif" font-size="9" font-weight="700" fill="#10B981" text-anchor="middle">PRODUCT DEMO</text>

        <!-- Play Button -->
        <circle cx="240" cy="138" r="28" fill="#10B981"/>
        <polygon points="234,125 252,138 234,151" fill="#ffffff"/>

        <!-- Laptop Base / Bottom Lip -->
        <path d="M 20 250 L 460 250 L 440 270 L 40 270 Z" fill="#3f3f46"/>
        <rect x="200" y="250" width="80" height="5" rx="2.5" fill="#27272a"/>
        <rect x="15" y="270" width="450" height="5" rx="2.5" fill="#18181b"/>
      </svg>
    `,
    getCanvasElements: (groupId, videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ') => [
      // Screen Frame
      {
        id: `el-lap-lid-${Date.now()}-1`,
        type: 'shape',
        shapeType: 'roundedRect',
        fill: '#27272a',
        stroke: '#3f3f46',
        strokeWidth: 2,
        borderRadius: 14,
        x: 55,
        y: 20,
        width: 370,
        height: 230,
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        groupId,
      },
      // Inner Screen
      {
        id: `el-lap-screen-${Date.now()}-2`,
        type: 'shape',
        shapeType: 'rect',
        fill: '#09090b',
        x: 68,
        y: 38,
        width: 344,
        height: 200,
        rotation: 0,
        opacity: 1,
        zIndex: 2,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      // Play Button
      {
        id: `el-lap-btn-${Date.now()}-3`,
        type: 'shape',
        shapeType: 'circle',
        fill: '#10B981',
        x: 212,
        y: 110,
        width: 56,
        height: 56,
        rotation: 0,
        opacity: 1,
        zIndex: 3,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      // Play Icon
      {
        id: `el-lap-tri-${Date.now()}-4`,
        type: 'shape',
        shapeType: 'rightTriangle',
        fill: '#ffffff',
        x: 233,
        y: 126,
        width: 20,
        height: 24,
        rotation: 90,
        opacity: 1,
        zIndex: 4,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      // Laptop Base
      {
        id: `el-lap-base-${Date.now()}-5`,
        type: 'shape',
        shapeType: 'roundedRect',
        fill: '#3f3f46',
        borderRadius: 4,
        x: 20,
        y: 250,
        width: 440,
        height: 18,
        rotation: 0,
        opacity: 1,
        zIndex: 5,
        groupId,
      },
    ],
  },

  // 3. Device Mockup - Smartphone / Mobile Reel Player
  {
    id: 'video-device-smartphone',
    title: 'Smartphone Reel Player',
    width: 260,
    height: 460,
    category: 'mockup',
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 460" width="100%" height="auto">
        <!-- Phone Outer Bezel -->
        <rect x="15" y="15" width="230" height="430" rx="36" fill="#18181b" stroke="#3f3f46" stroke-width="3"/>
        
        <!-- Dynamic Island / Notch -->
        <rect x="95" y="28" width="70" height="16" rx="8" fill="#09090b"/>
        
        <!-- Screen Content -->
        <rect x="27" y="52" width="206" height="380" rx="24" fill="#09090b"/>
        
        <!-- Background Gradient -->
        <defs>
          <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0F3D3E" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#09090b" stop-opacity="0.95"/>
          </linearGradient>
        </defs>
        <rect x="27" y="52" width="206" height="380" rx="24" fill="url(#phoneGrad)"/>

        <!-- Play Button -->
        <circle cx="130" cy="220" r="28" fill="#10B981"/>
        <polygon points="124,208 142,220 124,232" fill="#ffffff"/>

        <!-- Bottom Reel Caption -->
        <text x="45" y="380" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#ffffff">Watch Product Reel</text>
        <text x="45" y="398" font-family="Inter, sans-serif" font-size="10" font-weight="500" fill="#a1a1aa">Tap to play fullscreen</text>
      </svg>
    `,
    getCanvasElements: (groupId, videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ') => [
      // Phone Body
      {
        id: `el-phone-body-${Date.now()}-1`,
        type: 'shape',
        shapeType: 'roundedRect',
        fill: '#18181b',
        stroke: '#3f3f46',
        strokeWidth: 3,
        borderRadius: 36,
        x: 15,
        y: 15,
        width: 230,
        height: 430,
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        groupId,
      },
      // Phone Screen
      {
        id: `el-phone-screen-${Date.now()}-2`,
        type: 'shape',
        shapeType: 'roundedRect',
        fill: '#0F3D3E',
        borderRadius: 24,
        x: 27,
        y: 52,
        width: 206,
        height: 380,
        rotation: 0,
        opacity: 0.95,
        zIndex: 2,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      // Play Button
      {
        id: `el-phone-btn-${Date.now()}-3`,
        type: 'shape',
        shapeType: 'circle',
        fill: '#10B981',
        x: 102,
        y: 192,
        width: 56,
        height: 56,
        rotation: 0,
        opacity: 1,
        zIndex: 3,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      // Play Icon
      {
        id: `el-phone-tri-${Date.now()}-4`,
        type: 'shape',
        shapeType: 'rightTriangle',
        fill: '#ffffff',
        x: 123,
        y: 208,
        width: 20,
        height: 24,
        rotation: 90,
        opacity: 1,
        zIndex: 4,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      // Caption
      {
        id: `el-phone-txt-${Date.now()}-5`,
        type: 'text',
        text: 'Watch Product Reel\nTap to play fullscreen',
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#ffffff',
        textAlign: 'center',
        x: 35,
        y: 370,
        width: 190,
        height: 40,
        rotation: 0,
        opacity: 1,
        zIndex: 5,
        groupId,
      },
    ],
  },

  // 4. Product Showcase Card with Video & CTA
  {
    id: 'video-product-showcase',
    title: 'Product Showcase & Reel Card',
    width: 440,
    height: 340,
    category: 'product',
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 340" width="100%" height="auto">
        <!-- Outer Card -->
        <rect width="440" height="340" rx="14" fill="#18181b" stroke="#27272a" stroke-width="2"/>
        
        <!-- Video Top Half -->
        <rect x="12" y="12" width="416" height="200" rx="8" fill="#09090b"/>
        <circle cx="220" cy="112" r="28" fill="#10B981"/>
        <polygon points="214,99 232,112 214,125" fill="#ffffff"/>

        <!-- Top Left Pill -->
        <rect x="24" y="24" width="90" height="22" rx="4" fill="#000000" fill-opacity="0.7"/>
        <text x="69" y="39" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#E2DCC8" text-anchor="middle">VIDEO TOUR</text>

        <!-- Bottom Content -->
        <text x="24" y="245" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#ffffff">Premium Product In Action</text>
        <text x="24" y="268" font-family="Inter, sans-serif" font-size="12" font-weight="500" fill="#a1a1aa">Discover design details, engineering, and setup in this 2-min demo.</text>

        <!-- CTA Button -->
        <rect x="24" y="286" width="140" height="34" rx="6" fill="#0F3D3E" stroke="#10B981" stroke-width="1.5"/>
        <text x="94" y="307" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#E2DCC8" text-anchor="middle">▶ Watch Full Reel</text>
      </svg>
    `,
    getCanvasElements: (groupId, videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ') => [
      // Outer Card
      {
        id: `el-prodcard-bg-${Date.now()}-1`,
        type: 'shape',
        shapeType: 'roundedRect',
        fill: '#18181b',
        stroke: '#27272a',
        strokeWidth: 2,
        borderRadius: 14,
        x: 0,
        y: 0,
        width: 440,
        height: 340,
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        groupId,
      },
      // Video Box
      {
        id: `el-prodcard-vid-${Date.now()}-2`,
        type: 'shape',
        shapeType: 'roundedRect',
        fill: '#09090b',
        borderRadius: 8,
        x: 12,
        y: 12,
        width: 416,
        height: 200,
        rotation: 0,
        opacity: 1,
        zIndex: 2,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      // Play Button
      {
        id: `el-prodcard-btn-${Date.now()}-3`,
        type: 'shape',
        shapeType: 'circle',
        fill: '#10B981',
        x: 192,
        y: 84,
        width: 56,
        height: 56,
        rotation: 0,
        opacity: 1,
        zIndex: 3,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      // Play Icon
      {
        id: `el-prodcard-tri-${Date.now()}-4`,
        type: 'shape',
        shapeType: 'rightTriangle',
        fill: '#ffffff',
        x: 213,
        y: 100,
        width: 20,
        height: 24,
        rotation: 90,
        opacity: 1,
        zIndex: 4,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      // Title
      {
        id: `el-prodcard-title-${Date.now()}-5`,
        type: 'text',
        text: 'Premium Product In Action',
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 'bold',
        fill: '#ffffff',
        textAlign: 'left',
        x: 24,
        y: 228,
        width: 390,
        height: 24,
        rotation: 0,
        opacity: 1,
        zIndex: 5,
        groupId,
      },
      // Description
      {
        id: `el-prodcard-desc-${Date.now()}-6`,
        type: 'text',
        text: 'Discover design details, engineering, and setup in this 2-min demo.',
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: 'normal',
        fill: '#a1a1aa',
        textAlign: 'left',
        x: 24,
        y: 254,
        width: 390,
        height: 22,
        rotation: 0,
        opacity: 1,
        zIndex: 6,
        groupId,
      },
      // CTA Button
      {
        id: `el-prodcard-cta-${Date.now()}-7`,
        type: 'shape',
        shapeType: 'roundedRect',
        fill: '#0F3D3E',
        stroke: '#10B981',
        strokeWidth: 1.5,
        borderRadius: 6,
        x: 24,
        y: 286,
        width: 150,
        height: 34,
        rotation: 0,
        opacity: 1,
        zIndex: 7,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      {
        id: `el-prodcard-ctatxt-${Date.now()}-8`,
        type: 'text',
        text: '▶ Watch Full Reel',
        fontFamily: 'Inter',
        fontSize: 11,
        fontWeight: 'bold',
        fill: '#E2DCC8',
        textAlign: 'center',
        x: 24,
        y: 295,
        width: 150,
        height: 18,
        rotation: 0,
        opacity: 1,
        zIndex: 8,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
    ],
  },

  // 5. Luxury Gold & Emerald Cinematic Player
  {
    id: 'video-luxury-cinematic',
    title: 'Luxury Gold & Emerald Player',
    width: 460,
    height: 260,
    category: 'luxury',
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 260" width="100%" height="auto">
        <rect width="460" height="260" rx="10" fill="#121417" stroke="#E2DCC8" stroke-width="1.5" stroke-opacity="0.4"/>
        
        <!-- Corner Gold Accents -->
        <path d="M 10 25 L 10 10 L 25 10" fill="none" stroke="#E2DCC8" stroke-width="2"/>
        <path d="M 450 25 L 450 10 L 435 10" fill="none" stroke="#E2DCC8" stroke-width="2"/>
        <path d="M 10 235 L 10 250 L 25 250" fill="none" stroke="#E2DCC8" stroke-width="2"/>
        <path d="M 450 235 L 450 250 L 435 250" fill="none" stroke="#E2DCC8" stroke-width="2"/>

        <!-- Center Golden Play Icon -->
        <circle cx="230" cy="130" r="34" fill="#0F3D3E" stroke="#E2DCC8" stroke-width="2"/>
        <polygon points="224,116 244,130 224,144" fill="#E2DCC8"/>

        <!-- Top Title -->
        <text x="230" y="45" font-family="Montserrat, sans-serif" font-size="11" font-weight="700" fill="#E2DCC8" text-anchor="middle" letter-spacing="2">OFFICIAL BRAND FILM</text>
        <line x1="170" y1="55" x2="290" y2="55" stroke="#E2DCC8" stroke-opacity="0.4" stroke-width="1"/>
      </svg>
    `,
    getCanvasElements: (groupId, videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ') => [
      {
        id: `el-lux-bg-${Date.now()}-1`,
        type: 'shape',
        shapeType: 'roundedRect',
        fill: '#121417',
        stroke: '#E2DCC8',
        strokeWidth: 1.5,
        borderRadius: 10,
        x: 0,
        y: 0,
        width: 460,
        height: 260,
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      {
        id: `el-lux-title-${Date.now()}-2`,
        type: 'text',
        text: 'OFFICIAL BRAND FILM',
        fontFamily: 'Montserrat',
        fontSize: 11,
        fontWeight: 'bold',
        fill: '#E2DCC8',
        textAlign: 'center',
        x: 30,
        y: 35,
        width: 400,
        height: 20,
        rotation: 0,
        opacity: 0.9,
        zIndex: 2,
        groupId,
      },
      {
        id: `el-lux-btn-${Date.now()}-3`,
        type: 'shape',
        shapeType: 'circle',
        fill: '#0F3D3E',
        stroke: '#E2DCC8',
        strokeWidth: 2,
        x: 196,
        y: 96,
        width: 68,
        height: 68,
        rotation: 0,
        opacity: 1,
        zIndex: 3,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      {
        id: `el-lux-tri-${Date.now()}-4`,
        type: 'shape',
        shapeType: 'rightTriangle',
        fill: '#E2DCC8',
        x: 222,
        y: 116,
        width: 24,
        height: 28,
        rotation: 90,
        opacity: 1,
        zIndex: 4,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
    ],
  },

  // 6. Split Video & Feature Bullet Points
  {
    id: 'video-split-feature',
    title: 'Split Video & Key Highlights',
    width: 520,
    height: 220,
    category: 'split',
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 220" width="100%" height="auto">
        <!-- Outer Box -->
        <rect width="520" height="220" rx="12" fill="#18181b" stroke="#27272a" stroke-width="2"/>
        
        <!-- Left Video 16:9 Slice -->
        <rect x="12" y="12" width="240" height="196" rx="8" fill="#09090b"/>
        <circle cx="132" cy="110" r="26" fill="#10B981"/>
        <polygon points="126,98 142,110 126,122" fill="#ffffff"/>

        <!-- Right Side Features -->
        <text x="272" y="42" font-family="Inter, sans-serif" font-size="14" font-weight="800" fill="#ffffff">What's in this video:</text>
        
        <circle cx="282" cy="74" r="6" fill="#10B981"/>
        <text x="296" y="78" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#e4e4e7">Complete Unboxing & Setup</text>

        <circle cx="282" cy="114" r="6" fill="#10B981"/>
        <text x="296" y="118" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#e4e4e7">Real-world Stress Testing</text>

        <circle cx="282" cy="154" r="6" fill="#10B981"/>
        <text x="296" y="158" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#e4e4e7">Warranty & Service Guide</text>

        <text x="272" y="196" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#10B981">▶ Click player to watch (4:15)</text>
      </svg>
    `,
    getCanvasElements: (groupId, videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ') => [
      {
        id: `el-split-bg-${Date.now()}-1`,
        type: 'shape',
        shapeType: 'roundedRect',
        fill: '#18181b',
        stroke: '#27272a',
        strokeWidth: 2,
        borderRadius: 12,
        x: 0,
        y: 0,
        width: 520,
        height: 220,
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        groupId,
      },
      // Left Video Player
      {
        id: `el-split-vid-${Date.now()}-2`,
        type: 'shape',
        shapeType: 'roundedRect',
        fill: '#09090b',
        borderRadius: 8,
        x: 12,
        y: 12,
        width: 240,
        height: 196,
        rotation: 0,
        opacity: 1,
        zIndex: 2,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      {
        id: `el-split-btn-${Date.now()}-3`,
        type: 'shape',
        shapeType: 'circle',
        fill: '#10B981',
        x: 106,
        y: 84,
        width: 52,
        height: 52,
        rotation: 0,
        opacity: 1,
        zIndex: 3,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      {
        id: `el-split-tri-${Date.now()}-4`,
        type: 'shape',
        shapeType: 'rightTriangle',
        fill: '#ffffff',
        x: 125,
        y: 98,
        width: 18,
        height: 22,
        rotation: 90,
        opacity: 1,
        zIndex: 4,
        groupId,
        linkUrl: videoUrl,
        linkType: 'url',
      },
      // Right Title & Highlights
      {
        id: `el-split-txt-${Date.now()}-5`,
        type: 'text',
        text: "What's in this video:\n\n✓ Complete Unboxing & Setup\n✓ Real-world Stress Testing\n✓ Warranty & Service Guide\n\n▶ Click player to watch (4:15)",
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#ffffff',
        textAlign: 'left',
        x: 270,
        y: 25,
        width: 235,
        height: 170,
        rotation: 0,
        opacity: 1,
        zIndex: 5,
        groupId,
      },
    ],
  },
];
