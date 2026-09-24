import { TextBlockTemplate } from '../types';

export const textBlockTemplates: TextBlockTemplate[] = [
    {
      id: 'stat-active-users',
      title: '1.3 Million Active Users',
      width: 220,
      height: 220,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="220" height="220">
          <rect width="220" height="220" rx="20" fill="#7ECBF2"/>
          <text x="25" y="45" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#0E3B52" opacity="0.9">Our company has</text>
          <text x="25" y="65" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#0E3B52" opacity="0.9">attracted more than</text>
          <text x="25" y="125" font-family="Montserrat, sans-serif" font-size="44" font-weight="900" fill="#0E3B52" letter-spacing="-1">1.3</text>
          <text x="25" y="165" font-family="Montserrat, sans-serif" font-size="38" font-weight="900" fill="#0E3B52" letter-spacing="-1">Million</text>
          <text x="25" y="195" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#0E3B52" opacity="0.8" letter-spacing="1">MONTHLY ACTIVE USERS</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-bg-${Date.now()}-1`,
          type: 'shape',
          shapeType: 'roundedRect',
          fill: '#7ECBF2',
          x: 0,
          y: 0,
          width: 220,
          height: 220,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t1-${Date.now()}-2`,
          type: 'text',
          text: 'Our company has\nattracted more than',
          fontFamily: 'Inter',
          fontSize: 13,
          fontWeight: 'bold',
          fill: '#0E3B52',
          textAlign: 'left',
          x: 22,
          y: 20,
          width: 176,
          height: 40,
          rotation: 0,
          opacity: 0.9,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-3`,
          type: 'text',
          text: '1.3\nMillion',
          fontFamily: 'Montserrat',
          fontSize: 38,
          fontWeight: '900',
          fill: '#0E3B52',
          textAlign: 'left',
          x: 22,
          y: 65,
          width: 176,
          height: 90,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        },
        {
          id: `el-t3-${Date.now()}-4`,
          type: 'text',
          text: 'MONTHLY ACTIVE USERS',
          fontFamily: 'Inter',
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#0E3B52',
          textAlign: 'left',
          x: 22,
          y: 175,
          width: 176,
          height: 25,
          rotation: 0,
          opacity: 0.85,
          zIndex: 4,
          groupId,
        }
      ]
    },
    {
      id: 'marketing-updates',
      title: 'Marketing Updates',
      width: 280,
      height: 180,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180" width="280" height="180">
          <text x="20" y="50" font-family="Montserrat, sans-serif" font-size="28" font-weight="900" fill="#1E293B" letter-spacing="1">MARKETING</text>
          <text x="20" y="88" font-family="Montserrat, sans-serif" font-size="28" font-weight="900" fill="#0D9488" letter-spacing="1">UPDATES</text>
          <rect x="20" y="110" width="240" height="42" rx="4" fill="#007E7A"/>
          <text x="140" y="136" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">October 2030</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-t1-${Date.now()}-1`,
          type: 'text',
          text: 'MARKETING\nUPDATES',
          fontFamily: 'Montserrat',
          fontSize: 28,
          fontWeight: '900',
          fill: '#0D9488',
          textAlign: 'left',
          x: 0,
          y: 0,
          width: 260,
          height: 70,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-bg-${Date.now()}-2`,
          type: 'shape',
          shapeType: 'roundedRect',
          fill: '#007E7A',
          x: 0,
          y: 80,
          width: 260,
          height: 44,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-3`,
          type: 'text',
          text: 'October 2030',
          fontFamily: 'Inter',
          fontSize: 16,
          fontWeight: 'bold',
          fill: '#FFFFFF',
          textAlign: 'center',
          x: 0,
          y: 90,
          width: 260,
          height: 30,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        }
      ]
    },
    {
      id: 'mentor-workplace',
      title: 'Workplace Introduction',
      width: 260,
      height: 220,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 220" width="260" height="220">
          <circle cx="130" cy="55" r="42" fill="#FFEDD5" stroke="#EA580C" stroke-width="3.5"/>
          <circle cx="130" cy="45" r="14" fill="#EA580C"/>
          <path d="M 105 82 C 105 65, 155 65, 155 82 Z" fill="#EA580C"/>
          <text x="130" y="125" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#EA580C" text-anchor="middle">Introduction</text>
          <text x="130" y="152" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#1E293B" text-anchor="middle">Finding a mentor in</text>
          <text x="130" y="174" font-family="Inter, sans-serif" font-size="16" font-weight="800" fill="#1E293B" text-anchor="middle">the workplace</text>
          <text x="130" y="202" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#EA580C" text-anchor="middle">Duration: 30 minutes</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-bg-${Date.now()}-1`,
          type: 'shape',
          shapeType: 'circle',
          fill: '#FFEDD5',
          stroke: '#EA580C',
          strokeWidth: 3,
          x: 95,
          y: 0,
          width: 70,
          height: 70,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t1-${Date.now()}-2`,
          type: 'text',
          text: 'Introduction',
          fontFamily: 'Inter',
          fontSize: 13,
          fontWeight: 'bold',
          fill: '#EA580C',
          textAlign: 'center',
          x: 0,
          y: 80,
          width: 260,
          height: 22,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-3`,
          type: 'text',
          text: 'Finding a mentor in\nthe workplace',
          fontFamily: 'Inter',
          fontSize: 16,
          fontWeight: '800',
          fill: '#1E293B',
          textAlign: 'center',
          x: 0,
          y: 104,
          width: 260,
          height: 48,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        },
        {
          id: `el-t3-${Date.now()}-4`,
          type: 'text',
          text: 'Duration: 30 minutes',
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: '600',
          fill: '#EA580C',
          textAlign: 'center',
          x: 0,
          y: 156,
          width: 260,
          height: 22,
          rotation: 0,
          opacity: 1,
          zIndex: 4,
          groupId,
        }
      ]
    },
    {
      id: 'units-sold-card',
      title: 'Units Sold Counter',
      width: 280,
      height: 110,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 110" width="280" height="110">
          <rect x="5" y="5" width="270" height="100" rx="14" fill="#FFFFFF" stroke="#E04F39" stroke-width="2.5"/>
          <text x="140" y="40" font-family="Inter, sans-serif" font-size="12" font-weight="500" fill="#64748B" text-anchor="middle">Additional units sold since last month</text>
          <text x="140" y="85" font-family="Montserrat, sans-serif" font-size="34" font-weight="900" fill="#E04F39" text-anchor="middle" letter-spacing="-0.5">1,269,000</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-bg-${Date.now()}-1`,
          type: 'shape',
          shapeType: 'roundedRect',
          fill: '#FFFFFF',
          stroke: '#E04F39',
          strokeWidth: 2.5,
          x: 0,
          y: 0,
          width: 280,
          height: 110,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t1-${Date.now()}-2`,
          type: 'text',
          text: 'Additional units sold since last month',
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: '500',
          fill: '#64748B',
          textAlign: 'center',
          x: 10,
          y: 16,
          width: 260,
          height: 24,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-3`,
          type: 'text',
          text: '1,269,000',
          fontFamily: 'Montserrat',
          fontSize: 34,
          fontWeight: '900',
          fill: '#E04F39',
          textAlign: 'center',
          x: 10,
          y: 46,
          width: 260,
          height: 50,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        }
      ]
    },
    {
      id: 'data-driven-banner',
      title: 'Data-Driven Ribbon',
      width: 320,
      height: 110,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" width="320" height="110">
          <polygon points="25,15 315,15 295,95 5,95" fill="#4939B5"/>
          <text x="160" y="48" font-family="Montserrat, sans-serif" font-size="14" font-weight="800" fill="#FDE047" text-anchor="middle" letter-spacing="2">DATA-DRIVEN</text>
          <text x="160" y="80" font-family="Montserrat, sans-serif" font-size="22" font-weight="900" fill="#FDE047" text-anchor="middle" letter-spacing="1">DECISION MAKING</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-bg-${Date.now()}-1`,
          type: 'shape',
          shapeType: 'parallelogram',
          fill: '#4939B5',
          x: 0,
          y: 0,
          width: 320,
          height: 90,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t1-${Date.now()}-2`,
          type: 'text',
          text: 'DATA-DRIVEN\nDECISION MAKING',
          fontFamily: 'Montserrat',
          fontSize: 18,
          fontWeight: '900',
          fill: '#FDE047',
          textAlign: 'center',
          x: 10,
          y: 18,
          width: 300,
          height: 55,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        }
      ]
    },
    {
      id: 'company-presentation',
      title: 'Company Presentation',
      width: 320,
      height: 140,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 140" width="320" height="140">
          <text x="10" y="45" font-family="Montserrat, sans-serif" font-size="28" font-weight="900" fill="#0F172A" letter-spacing="2">COMPANY</text>
          <text x="10" y="80" font-family="Montserrat, sans-serif" font-size="28" font-weight="900" fill="#0F172A" letter-spacing="2">PRESENTATION</text>
          <rect x="10" y="98" width="160" height="4" fill="#F59E0B" rx="2"/>
          <text x="10" y="125" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#64748B" letter-spacing="1">Apex Innovations Corp</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-t1-${Date.now()}-1`,
          type: 'text',
          text: 'COMPANY\nPRESENTATION',
          fontFamily: 'Montserrat',
          fontSize: 28,
          fontWeight: '900',
          fill: '#0F172A',
          textAlign: 'left',
          x: 0,
          y: 0,
          width: 300,
          height: 70,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-line-${Date.now()}-2`,
          type: 'shape',
          shapeType: 'line',
          fill: '#F59E0B',
          x: 0,
          y: 78,
          width: 160,
          height: 4,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-3`,
          type: 'text',
          text: 'Apex Innovations Corp',
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: '600',
          fill: '#64748B',
          textAlign: 'left',
          x: 0,
          y: 90,
          width: 260,
          height: 25,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        }
      ]
    },
    {
      id: 'deal-of-day',
      title: 'Deal of the Day',
      width: 260,
      height: 200,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 200" width="260" height="200">
          <text x="130" y="65" font-family="'Playfair Display', serif, Times" font-size="56" font-weight="900" fill="#111827" text-anchor="middle" letter-spacing="4">DEAL</text>
          <line x1="45" y1="95" x2="85" y2="95" stroke="#111827" stroke-width="1.5" opacity="0.4"/>
          <text x="130" y="100" font-family="'Playfair Display', serif" font-size="20" font-style="italic" fill="#111827" opacity="0.8" text-anchor="middle">of the</text>
          <line x1="175" y1="95" x2="215" y2="95" stroke="#111827" stroke-width="1.5" opacity="0.4"/>
          <text x="130" y="165" font-family="'Playfair Display', serif, Times" font-size="64" font-weight="900" fill="#111827" text-anchor="middle" letter-spacing="4">DAY</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-t1-${Date.now()}-1`,
          type: 'text',
          text: 'DEAL',
          fontFamily: 'Playfair Display',
          fontSize: 48,
          fontWeight: 'bold',
          fill: '#111827',
          textAlign: 'center',
          x: 0,
          y: 0,
          width: 240,
          height: 52,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-l1-${Date.now()}-2`,
          type: 'shape',
          shapeType: 'line',
          fill: '#111827',
          x: 20,
          y: 65,
          width: 50,
          height: 2,
          rotation: 0,
          opacity: 0.5,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-3`,
          type: 'text',
          text: 'of the',
          fontFamily: 'Playfair Display',
          fontSize: 18,
          fontStyle: 'italic',
          fill: '#111827',
          textAlign: 'center',
          x: 75,
          y: 55,
          width: 90,
          height: 25,
          rotation: 0,
          opacity: 0.85,
          zIndex: 3,
          groupId,
        },
        {
          id: `el-l2-${Date.now()}-4`,
          type: 'shape',
          shapeType: 'line',
          fill: '#111827',
          x: 170,
          y: 65,
          width: 50,
          height: 2,
          rotation: 0,
          opacity: 0.5,
          zIndex: 4,
          groupId,
        },
        {
          id: `el-t3-${Date.now()}-5`,
          type: 'text',
          text: 'DAY',
          fontFamily: 'Playfair Display',
          fontSize: 54,
          fontWeight: 'bold',
          fill: '#111827',
          textAlign: 'center',
          x: 0,
          y: 80,
          width: 240,
          height: 60,
          rotation: 0,
          opacity: 1,
          zIndex: 5,
          groupId,
        }
      ]
    },
    {
      id: 'order-metric-card',
      title: 'Total Orders Metric',
      width: 240,
      height: 140,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
          <rect width="240" height="140" rx="16" fill="#1C53B2"/>
          <text x="25" y="55" font-family="Inter, sans-serif" font-size="34" font-weight="900" fill="#FBBF24">↑</text>
          <text x="60" y="55" font-family="Montserrat, sans-serif" font-size="36" font-weight="900" fill="#FFFFFF">1,507</text>
          <text x="25" y="95" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="#DBEAFE">Total Orders</text>
          <text x="25" y="120" font-family="Inter, sans-serif" font-size="13" font-weight="500" fill="#BFDBFE">+ 11% from last week</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-bg-${Date.now()}-1`,
          type: 'shape',
          shapeType: 'roundedRect',
          fill: '#1C53B2',
          x: 0,
          y: 0,
          width: 240,
          height: 140,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t1-${Date.now()}-2`,
          type: 'text',
          text: '↑ 1,507',
          fontFamily: 'Montserrat',
          fontSize: 32,
          fontWeight: '900',
          fill: '#FFFFFF',
          textAlign: 'left',
          x: 22,
          y: 18,
          width: 200,
          height: 40,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-3`,
          type: 'text',
          text: 'Total Orders',
          fontFamily: 'Inter',
          fontSize: 15,
          fontWeight: 'bold',
          fill: '#DBEAFE',
          textAlign: 'left',
          x: 22,
          y: 65,
          width: 200,
          height: 24,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        },
        {
          id: `el-t3-${Date.now()}-4`,
          type: 'text',
          text: '+ 11% from last week',
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: '500',
          fill: '#BFDBFE',
          textAlign: 'left',
          x: 22,
          y: 95,
          width: 200,
          height: 20,
          rotation: 0,
          opacity: 1,
          zIndex: 4,
          groupId,
        }
      ]
    },
    {
      id: 'testimonial-colin',
      title: 'Quote & Testimonial Card',
      width: 320,
      height: 200,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
          <rect width="320" height="200" rx="16" fill="#1B3B6F"/>
          <rect x="25" y="20" width="48" height="48" rx="8" fill="#FFFFFF" opacity="0.15"/>
          <circle cx="49" cy="38" r="8" fill="#FFFFFF" opacity="0.8"/>
          <path d="M 35 60 C 35 50, 63 50, 63 60 Z" fill="#FFFFFF" opacity="0.8"/>
          <text x="25" y="105" font-family="'Playfair Display', serif" font-size="14" font-style="italic" fill="#DBEAFE">"Success is not an accident; it is the result</text>
          <text x="25" y="128" font-family="'Playfair Display', serif" font-size="14" font-style="italic" fill="#DBEAFE">of vision, hard work, and the courage to</text>
          <text x="25" y="151" font-family="'Playfair Display', serif" font-size="14" font-style="italic" fill="#DBEAFE">take a step forward."</text>
          <text x="25" y="180" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#93C5FD">— Colin Powell</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-bg-${Date.now()}-1`,
          type: 'shape',
          shapeType: 'roundedRect',
          fill: '#1B3B6F',
          x: 0,
          y: 0,
          width: 320,
          height: 180,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t1-${Date.now()}-2`,
          type: 'text',
          text: '"Success is not an accident; it is the result of vision, hard work, and the courage to take a step forward."',
          fontFamily: 'Playfair Display',
          fontSize: 14,
          fontStyle: 'italic',
          fill: '#DBEAFE',
          textAlign: 'left',
          x: 20,
          y: 20,
          width: 280,
          height: 90,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-3`,
          type: 'text',
          text: '— Colin Powell',
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: 'bold',
          fill: '#93C5FD',
          textAlign: 'left',
          x: 20,
          y: 125,
          width: 280,
          height: 25,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        }
      ]
    },
    {
      id: 'instagram-followers',
      title: 'Instagram Followers Stat',
      width: 280,
      height: 110,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 110" width="280" height="110">
          <defs>
            <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#F59E0B"/>
              <stop offset="50%" stop-color="#E11D48"/>
              <stop offset="100%" stop-color="#9333EA"/>
            </linearGradient>
          </defs>
          <circle cx="50" cy="55" r="35" fill="url(#ig-grad)"/>
          <rect x="33" y="38" width="34" height="34" rx="9" fill="none" stroke="#FFFFFF" stroke-width="3"/>
          <circle cx="50" cy="55" r="8" fill="none" stroke="#FFFFFF" stroke-width="3"/>
          <circle cx="59" cy="46" r="2" fill="#FFFFFF"/>
          <text x="102" y="54" font-family="Montserrat, sans-serif" font-size="32" font-weight="900" fill="#9333EA">16,839</text>
          <text x="102" y="80" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="#64748B">Instagram Followers</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-bg-${Date.now()}-1`,
          type: 'shape',
          shapeType: 'circle',
          fill: '#9333EA',
          x: 0,
          y: 5,
          width: 60,
          height: 60,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t1-${Date.now()}-2`,
          type: 'text',
          text: '16,839',
          fontFamily: 'Montserrat',
          fontSize: 28,
          fontWeight: '900',
          fill: '#9333EA',
          textAlign: 'left',
          x: 75,
          y: 6,
          width: 200,
          height: 35,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-3`,
          type: 'text',
          text: 'Instagram Followers',
          fontFamily: 'Inter',
          fontSize: 13,
          fontWeight: 'bold',
          fill: '#64748B',
          textAlign: 'left',
          x: 75,
          y: 40,
          width: 200,
          height: 22,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        }
      ]
    },
    {
      id: 'popular-game-genres',
      title: 'Popular Game Genres',
      width: 320,
      height: 120,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" width="320" height="120">
          <line x1="10" y1="15" x2="310" y2="15" stroke="#0F172A" stroke-width="4"/>
          <text x="10" y="55" font-family="Montserrat, sans-serif" font-size="26" font-weight="900" fill="#0F172A">Popular Game Genres</text>
          <text x="10" y="85" font-family="Inter, sans-serif" font-size="13" font-weight="500" fill="#64748B">Explore the Top Game Genres Shaping</text>
          <text x="10" y="105" font-family="Inter, sans-serif" font-size="13" font-weight="500" fill="#64748B">Gaming Today</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-l-${Date.now()}-1`,
          type: 'shape',
          shapeType: 'line',
          fill: '#0F172A',
          x: 0,
          y: 0,
          width: 300,
          height: 4,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t1-${Date.now()}-2`,
          type: 'text',
          text: 'Popular Game Genres',
          fontFamily: 'Montserrat',
          fontSize: 24,
          fontWeight: '900',
          fill: '#0F172A',
          textAlign: 'left',
          x: 0,
          y: 15,
          width: 300,
          height: 35,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-3`,
          type: 'text',
          text: 'Explore the Top Game Genres Shaping\nGaming Today',
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: '500',
          fill: '#64748B',
          textAlign: 'left',
          x: 0,
          y: 52,
          width: 300,
          height: 38,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        }
      ]
    },
    {
      id: 'prochoice-talkshow',
      title: 'ProChoice Talkshow',
      width: 320,
      height: 120,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" width="320" height="120">
          <text x="160" y="45" font-family="'Playfair Display', serif" font-size="32" font-style="italic" font-weight="700" fill="#1E293B" text-anchor="middle">ProChoice</text>
          <text x="160" y="70" font-family="Montserrat, sans-serif" font-size="16" font-weight="900" fill="#1E293B" text-anchor="middle" letter-spacing="4">TALKSHOW</text>
          <line x1="40" y1="82" x2="280" y2="82" stroke="#1E293B" stroke-width="2"/>
          <line x1="40" y1="86" x2="280" y2="86" stroke="#1E293B" stroke-width="1"/>
          <text x="160" y="105" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#64748B" text-anchor="middle">EDUCATION AND EMPOWERMENT</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-t1-${Date.now()}-1`,
          type: 'text',
          text: 'ProChoice',
          fontFamily: 'Playfair Display',
          fontSize: 30,
          fontStyle: 'italic',
          fontWeight: 'bold',
          fill: '#1E293B',
          textAlign: 'center',
          x: 0,
          y: 0,
          width: 280,
          height: 36,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-2`,
          type: 'text',
          text: 'TALKSHOW',
          fontFamily: 'Montserrat',
          fontSize: 15,
          fontWeight: '900',
          fill: '#1E293B',
          textAlign: 'center',
          x: 0,
          y: 38,
          width: 280,
          height: 22,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-l-${Date.now()}-3`,
          type: 'shape',
          shapeType: 'line',
          fill: '#1E293B',
          x: 30,
          y: 64,
          width: 220,
          height: 2,
          rotation: 0,
          opacity: 0.7,
          zIndex: 3,
          groupId,
        },
        {
          id: `el-t3-${Date.now()}-4`,
          type: 'text',
          text: 'EDUCATION AND EMPOWERMENT',
          fontFamily: 'Inter',
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#64748B',
          textAlign: 'center',
          x: 0,
          y: 72,
          width: 280,
          height: 20,
          rotation: 0,
          opacity: 1,
          zIndex: 4,
          groupId,
        }
      ]
    },
    {
      id: 'initial-completion-date',
      title: 'Completion Dates Badge',
      width: 320,
      height: 140,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 140" width="320" height="140">
          <rect width="320" height="140" rx="16" fill="#FDE68A"/>
          <circle cx="45" cy="50" r="22" fill="#F59E0B"/>
          <path d="M 36 50 L 42 56 L 54 44" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          <text x="80" y="42" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#78350F">INITIAL COMPLETION DATE:</text>
          <text x="80" y="58" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#92400E">07/08/2030</text>
          <text x="80" y="92" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#78350F">REVISED COMPLETION</text>
          <text x="80" y="108" font-family="Inter, sans-serif" font-size="12" font-weight="900" fill="#78350F">PROJECTION: <tspan font-weight="600" fill="#92400E">08/28/2030</tspan></text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-bg-${Date.now()}-1`,
          type: 'shape',
          shapeType: 'roundedRect',
          fill: '#FDE68A',
          x: 0,
          y: 0,
          width: 320,
          height: 130,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-c-${Date.now()}-2`,
          type: 'shape',
          shapeType: 'circle',
          fill: '#F59E0B',
          x: 18,
          y: 20,
          width: 36,
          height: 36,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t1-${Date.now()}-3`,
          type: 'text',
          text: '✓',
          fontFamily: 'Inter',
          fontSize: 20,
          fontWeight: 'bold',
          fill: '#FFFFFF',
          textAlign: 'center',
          x: 18,
          y: 22,
          width: 36,
          height: 30,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-4`,
          type: 'text',
          text: 'INITIAL COMPLETION DATE: 07/08/2030\n\nREVISED COMPLETION PROJECTION: 08/28/2030',
          fontFamily: 'Inter',
          fontSize: 11,
          fontWeight: 'bold',
          fill: '#78350F',
          textAlign: 'left',
          x: 65,
          y: 18,
          width: 240,
          height: 90,
          rotation: 0,
          opacity: 1,
          zIndex: 4,
          groupId,
        }
      ]
    },
    {
      id: 'everything-you-need',
      title: 'Everything You Need To Know',
      width: 340,
      height: 140,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 140" width="340" height="140">
          <text x="170" y="30" font-family="Inter, sans-serif" font-size="13" font-style="italic" fill="#64748B" text-anchor="middle">A beginner's guide to</text>
          <text x="170" y="65" font-family="Montserrat, sans-serif" font-size="24" font-weight="900" fill="#0F172A" text-anchor="middle" letter-spacing="1">EVERYTHING YOU</text>
          <text x="170" y="95" font-family="Montserrat, sans-serif" font-size="24" font-weight="900" fill="#0F172A" text-anchor="middle" letter-spacing="1">NEED TO KNOW</text>
          <text x="170" y="125" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#94A3B8" text-anchor="middle" letter-spacing="1.5">COMMUNICATIONS &amp; DATA VISUALIZATION</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-t1-${Date.now()}-1`,
          type: 'text',
          text: "A beginner's guide to",
          fontFamily: 'Inter',
          fontSize: 13,
          fontStyle: 'italic',
          fill: '#64748B',
          textAlign: 'center',
          x: 0,
          y: 0,
          width: 320,
          height: 22,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-2`,
          type: 'text',
          text: 'EVERYTHING YOU\nNEED TO KNOW',
          fontFamily: 'Montserrat',
          fontSize: 22,
          fontWeight: '900',
          fill: '#0F172A',
          textAlign: 'center',
          x: 0,
          y: 24,
          width: 320,
          height: 55,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t3-${Date.now()}-3`,
          type: 'text',
          text: 'COMMUNICATIONS & DATA VISUALIZATION',
          fontFamily: 'Inter',
          fontSize: 9,
          fontWeight: 'bold',
          fill: '#94A3B8',
          textAlign: 'center',
          x: 0,
          y: 84,
          width: 320,
          height: 20,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        }
      ]
    },
    {
      id: 'inspiring-future',
      title: 'Inspiring Education Pill',
      width: 300,
      height: 140,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 140" width="300" height="140">
          <text x="150" y="45" font-family="Montserrat, sans-serif" font-size="22" font-weight="900" fill="#0F172A" text-anchor="middle">Inspiring the</text>
          <text x="150" y="72" font-family="Montserrat, sans-serif" font-size="22" font-weight="900" fill="#0F172A" text-anchor="middle">future through</text>
          <rect x="65" y="88" width="170" height="38" rx="8" fill="#5944D1"/>
          <text x="150" y="114" font-family="Montserrat, sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">education</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-t1-${Date.now()}-1`,
          type: 'text',
          text: 'Inspiring the\nfuture through',
          fontFamily: 'Montserrat',
          fontSize: 20,
          fontWeight: '900',
          fill: '#0F172A',
          textAlign: 'center',
          x: 0,
          y: 0,
          width: 280,
          height: 52,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-bg-${Date.now()}-2`,
          type: 'shape',
          shapeType: 'roundedRect',
          fill: '#5944D1',
          x: 60,
          y: 60,
          width: 160,
          height: 38,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-3`,
          type: 'text',
          text: 'education',
          fontFamily: 'Montserrat',
          fontSize: 18,
          fontWeight: '900',
          fill: '#FFFFFF',
          textAlign: 'center',
          x: 60,
          y: 66,
          width: 160,
          height: 30,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        }
      ]
    },
    {
      id: 'upcoming-tasks-notepad',
      title: 'Upcoming Tasks Card',
      width: 280,
      height: 200,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 200" width="280" height="200">
          <rect x="5" y="5" width="270" height="190" rx="12" fill="#FFFFFF" stroke="#0D9488" stroke-width="2.5"/>
          <rect x="25" y="24" width="20" height="18" rx="3" fill="none" stroke="#0D9488" stroke-width="2"/>
          <line x1="25" y1="30" x2="45" y2="30" stroke="#0D9488" stroke-width="2"/>
          <text x="55" y="38" font-family="Montserrat, sans-serif" font-size="14" font-weight="900" fill="#0D9488" letter-spacing="1">UPCOMING TASKS</text>
          <line x1="25" y1="52" x2="255" y2="52" stroke="#CCFBF1" stroke-width="1.5"/>
          <circle cx="35" cy="78" r="3" fill="#0D9488"/>
          <text x="48" y="82" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#334155">Review quarterly reports</text>
          <circle cx="35" cy="112" r="3" fill="#0D9488"/>
          <text x="48" y="116" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#334155">Conduct market research</text>
          <circle cx="35" cy="146" r="3" fill="#0D9488"/>
          <text x="48" y="150" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#334155">Schedule team sync meeting</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-bg-${Date.now()}-1`,
          type: 'shape',
          shapeType: 'roundedRect',
          fill: '#FFFFFF',
          stroke: '#0D9488',
          strokeWidth: 2.5,
          x: 0,
          y: 0,
          width: 280,
          height: 190,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t1-${Date.now()}-2`,
          type: 'text',
          text: 'UPCOMING TASKS',
          fontFamily: 'Montserrat',
          fontSize: 14,
          fontWeight: '900',
          fill: '#0D9488',
          textAlign: 'left',
          x: 20,
          y: 15,
          width: 240,
          height: 25,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-l-${Date.now()}-3`,
          type: 'shape',
          shapeType: 'line',
          fill: '#CCFBF1',
          x: 20,
          y: 44,
          width: 240,
          height: 2,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-4`,
          type: 'text',
          text: '• Review quarterly reports\n\n• Conduct market research\n\n• Schedule team sync meeting',
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: '600',
          fill: '#334155',
          textAlign: 'left',
          x: 20,
          y: 56,
          width: 240,
          height: 120,
          rotation: 0,
          opacity: 1,
          zIndex: 4,
          groupId,
        }
      ]
    },
    {
      id: 'boosting-business',
      title: 'Boosting Your Business',
      width: 320,
      height: 160,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160" width="320" height="160">
          <path d="M 0 0 L 280 0 Q 320 0 320 40 L 320 160 L 40 160 Q 0 160 0 120 Z" fill="#0D7657"/>
          <text x="30" y="55" font-family="Montserrat, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF">Boosting Your</text>
          <text x="30" y="85" font-family="Montserrat, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF">Business</text>
          <text x="30" y="120" font-family="Inter, sans-serif" font-size="12" font-weight="500" fill="#A7F3D0">Don't miss this opportunity to gain valuable</text>
          <text x="30" y="138" font-family="Inter, sans-serif" font-size="12" font-weight="500" fill="#A7F3D0">knowledge and network with industry experts.</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-bg-${Date.now()}-1`,
          type: 'shape',
          shapeType: 'roundedRect',
          fill: '#0D7657',
          x: 0,
          y: 0,
          width: 320,
          height: 150,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t1-${Date.now()}-2`,
          type: 'text',
          text: 'Boosting Your\nBusiness',
          fontFamily: 'Montserrat',
          fontSize: 22,
          fontWeight: '900',
          fill: '#FFFFFF',
          textAlign: 'left',
          x: 22,
          y: 16,
          width: 280,
          height: 55,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-3`,
          type: 'text',
          text: "Don't miss this opportunity to gain valuable knowledge and network with industry experts.",
          fontFamily: 'Inter',
          fontSize: 11,
          fontWeight: '500',
          fill: '#A7F3D0',
          textAlign: 'left',
          x: 22,
          y: 78,
          width: 280,
          height: 55,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        }
      ]
    },
    {
      id: 'volleyball-tournament',
      title: 'Tournament Headline',
      width: 320,
      height: 130,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" width="320" height="130">
          <text x="160" y="45" font-family="Oswald, Impact, sans-serif" font-size="34" font-weight="900" fill="#0F172A" text-anchor="middle" letter-spacing="2">VOLLEYBALL</text>
          <text x="160" y="85" font-family="Oswald, Impact, sans-serif" font-size="42" font-weight="900" fill="#0F172A" text-anchor="middle" letter-spacing="2">TOURNAMENT</text>
          <text x="160" y="115" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#64748B" text-anchor="middle">Get ready to show off your skills</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-t1-${Date.now()}-1`,
          type: 'text',
          text: 'VOLLEYBALL\nTOURNAMENT',
          fontFamily: 'Oswald',
          fontSize: 34,
          fontWeight: '900',
          fill: '#0F172A',
          textAlign: 'center',
          x: 0,
          y: 0,
          width: 300,
          height: 80,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-2`,
          type: 'text',
          text: 'Get ready to show off your skills',
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: '600',
          fill: '#64748B',
          textAlign: 'center',
          x: 0,
          y: 85,
          width: 300,
          height: 25,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        }
      ]
    },
    {
      id: 'event-date-saturday',
      title: 'Event Date & Location',
      width: 320,
      height: 160,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160" width="320" height="160">
          <text x="15" y="30" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#64748B" letter-spacing="1">9:00 AM - 6:00 PM</text>
          <text x="15" y="75" font-family="Oswald, Impact, sans-serif" font-size="44" font-weight="900" fill="#0F172A" letter-spacing="1">SATURDAY</text>
          <text x="15" y="118" font-family="Oswald, Impact, sans-serif" font-size="44" font-weight="900" fill="#0F172A" letter-spacing="1">MAY 20, 2028</text>
          <text x="15" y="148" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#64748B">2366 Juniper Drive Bay City</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-t1-${Date.now()}-1`,
          type: 'text',
          text: '9:00 AM - 6:00 PM',
          fontFamily: 'Inter',
          fontSize: 13,
          fontWeight: 'bold',
          fill: '#64748B',
          textAlign: 'left',
          x: 0,
          y: 0,
          width: 280,
          height: 22,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-2`,
          type: 'text',
          text: 'SATURDAY\nMAY 20, 2028',
          fontFamily: 'Oswald',
          fontSize: 38,
          fontWeight: '900',
          fill: '#0F172A',
          textAlign: 'left',
          x: 0,
          y: 25,
          width: 280,
          height: 85,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t3-${Date.now()}-3`,
          type: 'text',
          text: '2366 Juniper Drive Bay City',
          fontFamily: 'Inter',
          fontSize: 13,
          fontWeight: 'bold',
          fill: '#64748B',
          textAlign: 'left',
          x: 0,
          y: 118,
          width: 280,
          height: 25,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        }
      ]
    },
    {
      id: 'apply-now-cta',
      title: 'Apply Now Badge',
      width: 240,
      height: 75,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 75" width="240" height="75">
          <polygon points="10,8 195,8 230,37.5 195,67 10,67" fill="#CB5824"/>
          <text x="105" y="44" font-family="Montserrat, sans-serif" font-size="19" font-weight="900" fill="#FFFFFF" text-anchor="middle">Apply now!</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-bg-${Date.now()}-1`,
          type: 'shape',
          shapeType: 'chevron',
          fill: '#CB5824',
          x: 0,
          y: 0,
          width: 220,
          height: 60,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t-${Date.now()}-2`,
          type: 'text',
          text: 'Apply now!',
          fontFamily: 'Montserrat',
          fontSize: 20,
          fontWeight: '900',
          fill: '#FFFFFF',
          textAlign: 'center',
          x: 10,
          y: 16,
          width: 175,
          height: 35,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        }
      ]
    },
    {
      id: 'register-now-pill',
      title: 'Register Now Pill',
      width: 260,
      height: 75,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 75" width="260" height="75">
          <rect x="10" y="10" width="240" height="55" rx="27.5" fill="#1F4A65"/>
          <text x="130" y="44" font-family="Montserrat, sans-serif" font-size="17" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">REGISTER NOW</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-bg-${Date.now()}-1`,
          type: 'shape',
          shapeType: 'pill',
          fill: '#1F4A65',
          x: 0,
          y: 0,
          width: 240,
          height: 55,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t-${Date.now()}-2`,
          type: 'text',
          text: 'REGISTER NOW',
          fontFamily: 'Montserrat',
          fontSize: 16,
          fontWeight: '900',
          fill: '#FFFFFF',
          textAlign: 'center',
          x: 10,
          y: 16,
          width: 220,
          height: 30,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        }
      ]
    },
    {
      id: 'name-tag-melody',
      title: 'Business Card Name Tag',
      width: 280,
      height: 130,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 130" width="280" height="130">
          <rect x="5" y="5" width="270" height="120" rx="8" fill="#FFFFFF" stroke="#0D9488" stroke-width="2" stroke-dasharray="6,4"/>
          <text x="140" y="48" font-family="'Playfair Display', serif" font-size="22" font-weight="800" fill="#0F172A" text-anchor="middle">Melody Park</text>
          <text x="140" y="75" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#0D9488" text-anchor="middle">HR Specialist</text>
          <text x="140" y="98" font-family="Inter, sans-serif" font-size="11" font-weight="500" fill="#64748B" text-anchor="middle">mpark@greenwood.com • 740-738-8413</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-bg-${Date.now()}-1`,
          type: 'shape',
          shapeType: 'roundedRect',
          fill: '#FFFFFF',
          stroke: '#0D9488',
          strokeWidth: 2,
          x: 0,
          y: 0,
          width: 280,
          height: 120,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t1-${Date.now()}-2`,
          type: 'text',
          text: 'Melody Park',
          fontFamily: 'Playfair Display',
          fontSize: 22,
          fontWeight: 'bold',
          fill: '#0F172A',
          textAlign: 'center',
          x: 10,
          y: 16,
          width: 260,
          height: 30,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-3`,
          type: 'text',
          text: 'HR Specialist',
          fontFamily: 'Inter',
          fontSize: 13,
          fontWeight: 'bold',
          fill: '#0D9488',
          textAlign: 'center',
          x: 10,
          y: 48,
          width: 260,
          height: 24,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        },
        {
          id: `el-t3-${Date.now()}-4`,
          type: 'text',
          text: 'mpark@greenwood.com • 740-738-8413',
          fontFamily: 'Inter',
          fontSize: 11,
          fontWeight: '500',
          fill: '#64748B',
          textAlign: 'center',
          x: 10,
          y: 74,
          width: 260,
          height: 20,
          rotation: 0,
          opacity: 1,
          zIndex: 4,
          groupId,
        }
      ]
    },
    {
      id: 'avatar-amirah',
      title: 'Profile Badge - Amirah Khan',
      width: 300,
      height: 90,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 90" width="300" height="90">
          <circle cx="45" cy="45" r="32" fill="#FEF3C7" stroke="#F59E0B" stroke-width="3"/>
          <circle cx="45" cy="38" r="11" fill="#D97706"/>
          <path d="M 27 68 C 27 54, 63 54, 63 68 Z" fill="#D97706"/>
          <text x="95" y="42" font-family="Montserrat, sans-serif" font-size="18" font-weight="900" fill="#0F172A" letter-spacing="0.5">AMIRAH KHAN</text>
          <text x="95" y="62" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#64748B" letter-spacing="1">BUSINESS DEVELOPMENT OFFICER</text>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-bg-${Date.now()}-1`,
          type: 'shape',
          shapeType: 'circle',
          fill: '#FEF3C7',
          stroke: '#F59E0B',
          strokeWidth: 3,
          x: 0,
          y: 5,
          width: 50,
          height: 50,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t1-${Date.now()}-2`,
          type: 'text',
          text: 'AMIRAH KHAN',
          fontFamily: 'Montserrat',
          fontSize: 16,
          fontWeight: '900',
          fill: '#0F172A',
          textAlign: 'left',
          x: 65,
          y: 8,
          width: 220,
          height: 25,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-3`,
          type: 'text',
          text: 'BUSINESS DEVELOPMENT OFFICER',
          fontFamily: 'Inter',
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#64748B',
          textAlign: 'left',
          x: 65,
          y: 32,
          width: 220,
          height: 20,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        }
      ]
    },
    {
      id: 'capsule-marianne',
      title: 'Capsule Badge - Marianne Wilson',
      width: 300,
      height: 80,
      getSvg: () => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80" width="300" height="80">
          <rect x="5" y="8" width="290" height="64" rx="32" fill="#1B2A4A"/>
          <text x="28" y="38" font-family="Montserrat, sans-serif" font-size="16" font-weight="800" fill="#FFFFFF">Marianne Wilson</text>
          <text x="28" y="56" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#93C5FD">Learning Program Coordinator</text>
          <circle cx="260" cy="40" r="22" fill="#3B82F6"/>
          <circle cx="260" cy="34" r="7" fill="#FFFFFF"/>
          <path d="M 248 54 C 248 46, 272 46, 272 54 Z" fill="#FFFFFF"/>
        </svg>
      `,
      getCanvasElements: (groupId) => [
        {
          id: `el-bg-${Date.now()}-1`,
          type: 'shape',
          shapeType: 'pill',
          fill: '#1B2A4A',
          x: 0,
          y: 0,
          width: 290,
          height: 60,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          groupId,
        },
        {
          id: `el-t1-${Date.now()}-2`,
          type: 'text',
          text: 'Marianne Wilson',
          fontFamily: 'Montserrat',
          fontSize: 15,
          fontWeight: 'bold',
          fill: '#FFFFFF',
          textAlign: 'left',
          x: 20,
          y: 10,
          width: 200,
          height: 22,
          rotation: 0,
          opacity: 1,
          zIndex: 2,
          groupId,
        },
        {
          id: `el-t2-${Date.now()}-3`,
          type: 'text',
          text: 'Learning Program Coordinator',
          fontFamily: 'Inter',
          fontSize: 10,
          fontWeight: '600',
          fill: '#93C5FD',
          textAlign: 'left',
          x: 20,
          y: 32,
          width: 200,
          height: 18,
          rotation: 0,
          opacity: 1,
          zIndex: 3,
          groupId,
        },
        {
          id: `el-av-${Date.now()}-4`,
          type: 'shape',
          shapeType: 'circle',
          fill: '#3B82F6',
          x: 235,
          y: 10,
          width: 40,
          height: 40,
          rotation: 0,
          opacity: 1,
          zIndex: 4,
          groupId,
        }
      ]
    }
  ];
