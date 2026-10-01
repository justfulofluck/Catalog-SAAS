import { Shadow } from 'fabric';
import { CanvasElement } from '../../../types';
import { rgba } from './shapes';

export function measureWrappedTextHeight(
  text: any,
  width: number,
  fontSize: number,
  lineHeight: number = 1.2,
  fontWeight: string = 'normal'
): number {
  if (text === null || text === undefined || text === '') return 0;
  const clean = String(text).trim();
  const isBold =
    fontWeight === 'bold' ||
    fontWeight === '700' ||
    fontWeight === '800' ||
    fontWeight === '900';
  const avgCharW = fontSize * (isBold ? 0.62 : 0.55);
  const usableW = Math.max(10, width);
  const charsPerLine = Math.max(1, Math.floor(usableW / avgCharW));

  const words = clean.split(/\s+/);
  let lines = 1;
  let curLineLen = 0;
  words.forEach((word) => {
    if (word.length > charsPerLine) {
      if (curLineLen > 0) lines++;
      lines += Math.ceil(word.length / charsPerLine) - 1;
      curLineLen = word.length % charsPerLine || charsPerLine;
    } else if (curLineLen + word.length > charsPerLine) {
      lines++;
      curLineLen = word.length;
    } else {
      curLineLen += word.length + 1;
    }
  });
  return Math.ceil(lines * fontSize * lineHeight);
}

export function estimateTextWidth(
  text: any,
  fontSize: number,
  fontWeight: string = 'normal'
): number {
  if (text === null || text === undefined || text === '') return 0;
  const str = String(text);
  const isBold =
    fontWeight === 'bold' ||
    fontWeight === '700' ||
    fontWeight === '800' ||
    fontWeight === '900';
  return Math.ceil(str.length * fontSize * (isBold ? 0.62 : 0.55));
}

export function generateRichTextSvg(el: CanvasElement): string {
  const safeText = (el.text || '')
    .replace(/&nbsp;/g, '&#160;')
    .replace(/<br>/g, '<br/>')
    .replace(/&(?!(amp|lt|gt|quot|apos|#[0-9]+);)/g, '&amp;');
  const fontName = (el.fontFamily || 'Inter').replace(/\s+/g, '+');
  const fontImport = `@import url('https://fonts.googleapis.com/css2?family=${fontName}&display=swap');`;
  const isGradient = el.fill?.includes('gradient');
  const color = el.effectColor || '#000000';
  const color2 = el.effectColor2 || '#00fff9';
  const offX = el.shadowOffsetX || 0;
  const offY = el.shadowOffsetY || 0;
  const blurS = el.shadowBlur || 0;
  const opacity =
    el.shadowOpacity !== undefined && el.shadowOpacity !== null ? el.shadowOpacity : 0.5;
  const thickness = el.textStrokeWidth || 1;
  const spread =
    el.effectSpread !== undefined && el.effectSpread !== null ? el.effectSpread : 0;
  const roundness =
    el.effectRoundness !== undefined && el.effectRoundness !== null ? el.effectRoundness : 4;

  let effectStyles = '';
  if (el.effectStyle && el.effectStyle !== 'none') {
    switch (el.effectStyle) {
      case 'hollow':
        effectStyles = `-webkit-text-stroke: ${thickness}px ${color}; color: transparent;`;
        break;
      case 'outline':
        effectStyles = `-webkit-text-stroke: ${thickness}px ${color};`;
        break;
      case 'shadow':
        effectStyles = `text-shadow: ${offX}px ${offY}px ${blurS}px ${rgba(color, opacity)};`;
        break;
      case 'lift':
        effectStyles = `text-shadow: 0px 4px ${blurS}px rgba(0,0,0,${opacity});`;
        break;
      case 'neon':
        effectStyles = `color: ${color}; text-shadow: ${
          opacity > 0
            ? `0 0 ${5 * opacity}px ${color}, 0 0 ${10 * opacity}px ${color}, 0 0 ${
                20 * opacity
              }px ${color}`
            : 'none'
        };`;
        break;
      case 'glitch':
        effectStyles = `text-shadow: ${offX}px ${offY}px 0 ${color}, ${-offX}px ${-offY}px 0 ${color2};`;
        break;
      case 'echo':
        effectStyles = `text-shadow: ${offX}px ${offY}px 0px ${color}aa, ${
          offX * 2
        }px ${offY * 2}px 0px ${color}66, ${offX * 3}px ${offY * 3}px 0px ${color}33;`;
        break;
      case 'splice':
        effectStyles = `-webkit-text-stroke: ${thickness}px ${color}; text-shadow: ${offX}px ${offY}px 0px ${color}88;`;
        break;
      case 'background':
        effectStyles = `background: ${color}${Math.round(opacity * 255)
          .toString(16)
          .padStart(2, '0')}; padding: ${spread / 4}px ${spread / 2}px; border-radius: ${roundness}px; box-decoration-break: clone; -webkit-box-decoration-break: clone; display: inline-block;`;
        break;
    }
  }

  const gradientStyle = isGradient
    ? `background: ${el.fill}; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;`
    : `color: ${el.fill || '#000000'};`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${el.width}" height="${el.height}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;align-items:${
        el.verticalAlign === 'middle'
          ? 'center'
          : el.verticalAlign === 'bottom'
          ? 'flex-end'
          : 'flex-start'
      };justify-content:${el.textAlign || 'left'};box-sizing:border-box;">
        <style>${fontImport}</style>
        <div style="font-size:${el.fontSize || 16}px;font-family:${
    el.fontFamily || 'Inter'
  };font-weight:${el.fontWeight || 'normal'};font-style:${
    el.fontStyle || 'normal'
  };text-decoration:${el.textDecoration || 'none'};text-align:${
    el.textAlign || 'left'
  };line-height:${el.lineHeight || 1.2};letter-spacing:${
    el.letterSpacing || 0
  }px;${gradientStyle}width:100%;padding:5px;box-sizing:border-box;${effectStyles}white-space:pre-wrap;word-break:break-word;">${safeText}</div>
      </div>
    </foreignObject>
  </svg>`;
}

export async function loadSvgAsImage(svgString: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    const encoded = btoa(unescape(encodeURIComponent(svgString)));
    img.src = `data:image/svg+xml;base64,${encoded}`;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

export function applyTextEffectsToFabricObject(obj: any, el: Partial<CanvasElement>) {
  if (!obj) return;
  const effectStyle =
    el.effectStyle !== undefined ? el.effectStyle : obj._effectStyle || 'none';
  const color = el.effectColor !== undefined ? el.effectColor : obj._effectColor || '#000000';
  const color2 = el.effectColor2 !== undefined ? el.effectColor2 : obj._effectColor2 || '#00fff9';
  const blurVal =
    el.shadowBlur !== undefined && el.shadowBlur !== null
      ? Number(el.shadowBlur)
      : obj._effectBlur ?? 5;
  const ox =
    el.shadowOffsetX !== undefined && el.shadowOffsetX !== null
      ? Number(el.shadowOffsetX)
      : obj._effectOffsetX ?? 3;
  const oy =
    el.shadowOffsetY !== undefined && el.shadowOffsetY !== null
      ? Number(el.shadowOffsetY)
      : obj._effectOffsetY ?? 3;
  const opacity =
    el.shadowOpacity !== undefined && el.shadowOpacity !== null
      ? Number(el.shadowOpacity)
      : obj._effectOpacity ?? 0.6;
  const thickness =
    el.textStrokeWidth !== undefined && el.textStrokeWidth !== null
      ? Number(el.textStrokeWidth)
      : obj._effectThickness ?? 1.5;
  const baseFill =
    el.fill !== undefined
      ? el.fill
      : obj._baseFill ||
        (typeof obj.fill === 'string' && obj.fill !== 'transparent' ? obj.fill : '#000000');

  obj._effectStyle = effectStyle;
  obj._effectColor = color;
  obj._effectColor2 = color2;
  obj._effectBlur = blurVal;
  obj._effectOffsetX = ox;
  obj._effectOffsetY = oy;
  obj._effectOpacity = opacity;
  obj._effectThickness = thickness;
  obj._baseFill = baseFill;

  if (!obj._origRenderText && typeof obj._renderText === 'function') {
    obj._origRenderText = obj._renderText;
  }

  obj.set({
    shadow: null,
    stroke: null,
    strokeWidth: 0,
    backgroundColor: '',
    paintFirst: 'fill',
    fill: baseFill,
  });

  if (!effectStyle || effectStyle === 'none') {
    if (obj._origRenderText) {
      obj._renderText = obj._origRenderText;
    }
    return;
  }

  switch (effectStyle) {
    case 'shadow': {
      if (obj._origRenderText) obj._renderText = obj._origRenderText;
      obj.set({
        fill: baseFill,
        shadow: new Shadow({
          color: rgba(color, opacity),
          blur: blurVal,
          offsetX: ox,
          offsetY: oy,
        }),
      });
      break;
    }
    case 'lift': {
      if (obj._origRenderText) obj._renderText = obj._origRenderText;
      obj.set({
        fill: baseFill,
        shadow: new Shadow({
          color: `rgba(0,0,0,${opacity})`,
          blur: Math.max(blurVal, 8) * 1.5,
          offsetX: 0,
          offsetY: Math.max(oy, 4),
        }),
      });
      break;
    }
    case 'hollow': {
      if (obj._origRenderText) obj._renderText = obj._origRenderText;
      obj.set({
        fill: 'transparent',
        stroke: color || baseFill || '#000000',
        strokeWidth: thickness,
        paintFirst: 'stroke',
      });
      break;
    }
    case 'outline': {
      if (obj._origRenderText) obj._renderText = obj._origRenderText;
      obj.set({
        fill: baseFill,
        stroke: color || '#000000',
        strokeWidth: thickness,
        paintFirst: 'stroke',
      });
      break;
    }
    case 'neon': {
      if (obj._origRenderText) {
        obj._renderText = function (ctx: CanvasRenderingContext2D) {
          const neonColor =
            obj._effectColor ||
            (obj._baseFill && obj._baseFill !== '#ffffff' && obj._baseFill !== '#000000'
              ? obj._baseFill
              : '#ff007f');
          const b = obj._effectBlur || 15;
          const origShadow = this.shadow;
          const origFill = this.fill;

          ctx.save();
          this.fill = neonColor;
          this.shadow = new Shadow({ color: neonColor, blur: b * 1.8, offsetX: 0, offsetY: 0 });
          obj._origRenderText.call(this, ctx);
          ctx.restore();

          ctx.save();
          this.fill = neonColor;
          this.shadow = new Shadow({ color: neonColor, blur: b * 0.8, offsetX: 0, offsetY: 0 });
          obj._origRenderText.call(this, ctx);
          ctx.restore();

          ctx.save();
          this.fill = '#ffffff';
          this.shadow = new Shadow({ color: neonColor, blur: b * 0.3, offsetX: 0, offsetY: 0 });
          obj._origRenderText.call(this, ctx);
          ctx.restore();

          this.shadow = origShadow;
          this.fill = origFill;
        };
      }
      obj.set({
        fill: color || baseFill || '#ff007f',
      });
      break;
    }
    case 'glitch': {
      if (obj._origRenderText) {
        obj._renderText = function (ctx: CanvasRenderingContext2D) {
          const c1 = obj._effectColor || '#ff0055';
          const c2 = obj._effectColor2 || '#00fff9';
          const offX = obj._effectOffsetX ?? 3;
          const offY = obj._effectOffsetY ?? 3;
          const origFill = this.fill;
          const origShadow = this.shadow;
          this.shadow = null;

          ctx.save();
          ctx.translate(-offX, -offY);
          this.fill = c2;
          obj._origRenderText.call(this, ctx);
          ctx.restore();

          ctx.save();
          ctx.translate(offX, offY);
          this.fill = c1;
          obj._origRenderText.call(this, ctx);
          ctx.restore();

          ctx.save();
          this.fill = obj._baseFill || '#000000';
          obj._origRenderText.call(this, ctx);
          ctx.restore();

          this.fill = origFill;
          this.shadow = origShadow;
        };
      }
      obj.set({
        fill: baseFill || '#000000',
      });
      break;
    }
    case 'echo': {
      if (obj._origRenderText) {
        obj._renderText = function (ctx: CanvasRenderingContext2D) {
          const c = obj._effectColor || '#000000';
          const offX = obj._effectOffsetX ?? 4;
          const offY = obj._effectOffsetY ?? 4;
          const op = obj._effectOpacity ?? 0.5;
          const origFill = this.fill;
          const origShadow = this.shadow;
          this.shadow = null;

          for (let i = 3; i >= 1; i--) {
            ctx.save();
            ctx.translate(offX * i, offY * i);
            this.fill = rgba(c, op * (0.33 * (4 - i)));
            obj._origRenderText.call(this, ctx);
            ctx.restore();
          }

          ctx.save();
          this.fill = obj._baseFill || '#000000';
          obj._origRenderText.call(this, ctx);
          ctx.restore();

          this.fill = origFill;
          this.shadow = origShadow;
        };
      }
      obj.set({
        fill: baseFill || '#000000',
      });
      break;
    }
    case 'splice': {
      if (obj._origRenderText) {
        obj._renderText = function (ctx: CanvasRenderingContext2D) {
          const c1 = obj._effectColor || '#000000';
          const c2 = obj._effectColor2 || '#8B3DFF';
          const offX = obj._effectOffsetX ?? 3;
          const offY = obj._effectOffsetY ?? 3;
          const thick = obj._effectThickness ?? 2;
          const origFill = this.fill;
          const origStroke = this.stroke;
          const origStrokeWidth = this.strokeWidth;
          const origShadow = this.shadow;
          this.shadow = null;

          ctx.save();
          ctx.translate(offX, offY);
          this.fill = c2;
          this.stroke = null;
          this.strokeWidth = 0;
          obj._origRenderText.call(this, ctx);
          ctx.restore();

          ctx.save();
          this.fill = 'transparent';
          this.stroke = c1;
          this.strokeWidth = thick;
          this.paintFirst = 'stroke';
          obj._origRenderText.call(this, ctx);
          ctx.restore();

          this.fill = origFill;
          this.stroke = origStroke;
          this.strokeWidth = origStrokeWidth;
          this.shadow = origShadow;
        };
      }
      obj.set({
        fill: 'transparent',
      });
      break;
    }
    case 'background': {
      if (obj._origRenderText) obj._renderText = obj._origRenderText;
      obj.set({
        fill: baseFill,
        backgroundColor: rgba(color || '#8B3DFF', opacity || 1),
      });
      break;
    }
  }
}
