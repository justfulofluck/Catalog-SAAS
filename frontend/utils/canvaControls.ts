import {
  Control,
  controlsUtils,
  InteractiveFabricObject,
  FabricObject,
  ActiveSelection,
  Textbox,
  Group,
  util,
} from 'fabric';

export const CANVA_THEME = {
  borderColor: '#8B3DFF', // Signature Canva violet/purple
  cornerColor: '#ffffff', // Solid white circles
  cornerStrokeColor: 'rgba(0, 0, 0, 0.12)', // Ultra subtle clean outline for contrast on white
  cornerSize: 15, // Prominent comfortable white circular handles
  sidePillWidth: 7, // 7px width
  sidePillHeight: 22, // 22px height
  sidePillRadius: 3.5, // Smooth pill / capsule curvature
  topPillWidth: 22, // 22px width for top/bottom horizontal pills
  topPillHeight: 7, // 7px height for top/bottom horizontal pills
  topPillRadius: 3.5, // Smooth pill curvature
  actionButtonSize: 28, // Elevated circular action buttons
  actionButtonOffsetY: 32, // Distance below bottom selection border
  actionButtonSpacing: 18, // Centers at -18px and +18px (36px apart)
};

/**
 * Render standard circular white corner controls with subtle drop shadow (matching Screenshot 2).
 */
export function renderCanvaCornerControl(
  this: Control,
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _styleOverride: any,
  _fabricObject: any
) {
  ctx.save();
  ctx.translate(left, top);

  const radius = (this.sizeX || CANVA_THEME.cornerSize) / 2;

  // Soft elevation shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Subtle clean border for contrast against white backgrounds
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 1;
  ctx.strokeStyle = CANVA_THEME.cornerStrokeColor;
  ctx.stroke();

  ctx.restore();
}

/**
 * Render vertical white pill/capsule control for side width resizing (ml / mr) (matching Screenshot 2).
 */
export function renderCanvaSidePillControl(
  this: Control,
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _styleOverride: any,
  fabricObject: any
) {
  ctx.save();
  ctx.translate(left, top);

  // Rotate pill with object's angle
  const angle = fabricObject?.getTotalAngle?.() ?? fabricObject?.angle ?? 0;
  ctx.rotate((angle * Math.PI) / 180);

  const w = CANVA_THEME.sidePillWidth;
  const h = CANVA_THEME.sidePillHeight;
  const r = CANVA_THEME.sidePillRadius;

  // Soft elevation shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-w / 2, -h / 2, w, h, r);
  } else {
    const hw = w / 2;
    const hh = h / 2;
    ctx.moveTo(-hw + r, -hh);
    ctx.lineTo(hw - r, -hh);
    ctx.quadraticCurveTo(hw, -hh, hw, -hh + r);
    ctx.lineTo(hw, hh - r);
    ctx.quadraticCurveTo(hw, hh, hw - r, hh);
    ctx.lineTo(-hw + r, hh);
    ctx.quadraticCurveTo(-hw, hh, -hw, hh - r);
    ctx.lineTo(-hw, -hh + r);
    ctx.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  }
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Subtle clean border for contrast against white backgrounds
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 1;
  ctx.strokeStyle = CANVA_THEME.cornerStrokeColor;
  ctx.stroke();

  ctx.restore();
}

/**
 * Render horizontal white pill/capsule control for top and bottom height resizing (mt / mb) (matching Canva screenshot).
 */
export function renderCanvaTopBottomPillControl(
  this: Control,
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _styleOverride: any,
  fabricObject: any
) {
  ctx.save();
  ctx.translate(left, top);

  // Rotate pill with object's angle
  const angle = fabricObject?.getTotalAngle?.() ?? fabricObject?.angle ?? 0;
  ctx.rotate((angle * Math.PI) / 180);

  const w = CANVA_THEME.topPillWidth;
  const h = CANVA_THEME.topPillHeight;
  const r = CANVA_THEME.topPillRadius;

  // Soft elevation shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-w / 2, -h / 2, w, h, r);
  } else {
    const hw = w / 2;
    const hh = h / 2;
    ctx.moveTo(-hw + r, -hh);
    ctx.lineTo(hw - r, -hh);
    ctx.quadraticCurveTo(hw, -hh, hw, -hh + r);
    ctx.lineTo(hw, hh - r);
    ctx.quadraticCurveTo(hw, hh, hw - r, hh);
    ctx.lineTo(-hw + r, hh);
    ctx.quadraticCurveTo(-hw, hh, -hw, hh - r);
    ctx.lineTo(-hw, -hh + r);
    ctx.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  }
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Subtle clean border for contrast against white backgrounds
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 1;
  ctx.strokeStyle = CANVA_THEME.cornerStrokeColor;
  ctx.stroke();

  ctx.restore();
}

/**
 * Render circular Rotate action button below selection (matching Screenshot 2).
 */
export function renderCanvaRotateButton(
  this: Control,
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _styleOverride: any,
  _fabricObject: any
) {
  ctx.save();
  ctx.translate(left, top);

  const radius = CANVA_THEME.actionButtonSize / 2;

  // Elevated button shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Subtle clean border
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.stroke();

  // Draw Rotate Icon (two distinct separate curved arrows with clear gaps, matching Screenshot 2)
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const r = 5.2;

  // Arc 1 (curves over the top clockwise from left to top-right)
  ctx.beginPath();
  ctx.arc(0, 0, r, Math.PI * 1.05, Math.PI * 1.68, false);
  ctx.stroke();

  // Arrowhead 1 at (r * cos(1.68π), r * sin(1.68π)) pointing clockwise / down-right
  const a1 = Math.PI * 1.68;
  const x1 = Math.cos(a1) * r;
  const y1 = Math.sin(a1) * r;
  ctx.beginPath();
  ctx.moveTo(x1 - 2.4, y1 - 0.2);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x1 - 0.8, y1 - 2.3);
  ctx.stroke();

  // Arc 2 (curves under the bottom clockwise from right to bottom-left)
  ctx.beginPath();
  ctx.arc(0, 0, r, Math.PI * 0.05, Math.PI * 0.68, false);
  ctx.stroke();

  // Arrowhead 2 at (r * cos(0.68π), r * sin(0.68π)) pointing clockwise / up-left
  const a2 = Math.PI * 0.68;
  const x2 = Math.cos(a2) * r;
  const y2 = Math.sin(a2) * r;
  ctx.beginPath();
  ctx.moveTo(x2 + 2.4, y2 + 0.2);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2 + 0.8, y2 + 2.3);
  ctx.stroke();

  ctx.restore();
}

/**
 * Render circular Move / Drag 4-way arrow action button below selection (matching Screenshot 2).
 */
export function renderCanvaMoveButton(
  this: Control,
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _styleOverride: any,
  _fabricObject: any
) {
  ctx.save();
  ctx.translate(left, top);

  const radius = CANVA_THEME.actionButtonSize / 2;

  // Elevated button shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Subtle clean border
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.stroke();

  // Draw 4-way Move Cross Icon (clear stems with separate open chevrons, matching Screenshot 2)
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const stem = 6.4;
  const wing = 2.1;
  const back = 4.4;

  // Horizontal stem
  ctx.beginPath();
  ctx.moveTo(-stem, 0);
  ctx.lineTo(stem, 0);
  ctx.stroke();

  // Vertical stem
  ctx.beginPath();
  ctx.moveTo(0, -stem);
  ctx.lineTo(0, stem);
  ctx.stroke();

  // Top Arrow (pointing up)
  ctx.beginPath();
  ctx.moveTo(-wing, -back);
  ctx.lineTo(0, -stem);
  ctx.lineTo(wing, -back);
  ctx.stroke();

  // Bottom Arrow (pointing down)
  ctx.beginPath();
  ctx.moveTo(-wing, back);
  ctx.lineTo(0, stem);
  ctx.lineTo(wing, back);
  ctx.stroke();

  // Left Arrow (pointing left)
  ctx.beginPath();
  ctx.moveTo(-back, -wing);
  ctx.lineTo(-stem, 0);
  ctx.lineTo(-back, wing);
  ctx.stroke();

  // Right Arrow (pointing right)
  ctx.beginPath();
  ctx.moveTo(back, -wing);
  ctx.lineTo(stem, 0);
  ctx.lineTo(back, wing);
  ctx.stroke();

  ctx.restore();
}

/**
 * Creates the complete Canva-style control set:
 * - 4 circular white corner controls
 * - 2 vertical white pill side handles (ml, mr)
 * - 2 bottom floating action buttons (rotate, drag)
 * - No top mtr stick, no top/bottom middle handles
 */
export function createCanvaControls(isTextbox: boolean = false): Record<string, Control> {
  return {
    // 4 Corner Circles
    tl: new Control({
      x: -0.5,
      y: -0.5,
      cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
      actionHandler: controlsUtils.scalingEqually,
      render: renderCanvaCornerControl,
      sizeX: CANVA_THEME.cornerSize,
      sizeY: CANVA_THEME.cornerSize,
      touchSizeX: 24,
      touchSizeY: 24,
    }),
    tr: new Control({
      x: 0.5,
      y: -0.5,
      cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
      actionHandler: controlsUtils.scalingEqually,
      render: renderCanvaCornerControl,
      sizeX: CANVA_THEME.cornerSize,
      sizeY: CANVA_THEME.cornerSize,
      touchSizeX: 24,
      touchSizeY: 24,
    }),
    bl: new Control({
      x: -0.5,
      y: 0.5,
      cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
      actionHandler: controlsUtils.scalingEqually,
      render: renderCanvaCornerControl,
      sizeX: CANVA_THEME.cornerSize,
      sizeY: CANVA_THEME.cornerSize,
      touchSizeX: 24,
      touchSizeY: 24,
    }),
    br: new Control({
      x: 0.5,
      y: 0.5,
      cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
      actionHandler: controlsUtils.scalingEqually,
      render: renderCanvaCornerControl,
      sizeX: CANVA_THEME.cornerSize,
      sizeY: CANVA_THEME.cornerSize,
      touchSizeX: 24,
      touchSizeY: 24,
    }),

    // Side Pill Handles (Width Resizing for Text, Scaling for others)
    ml: new Control({
      x: -0.5,
      y: 0,
      actionHandler: isTextbox ? controlsUtils.changeWidth : controlsUtils.scalingXOrSkewingY,
      cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
      actionName: isTextbox ? 'resizing' : undefined,
      getActionName: isTextbox ? undefined : controlsUtils.scaleOrSkewActionName,
      render: renderCanvaSidePillControl,
      sizeX: CANVA_THEME.sidePillWidth + 4,
      sizeY: CANVA_THEME.sidePillHeight + 4,
      touchSizeX: 24,
      touchSizeY: 28,
    }),
    mr: new Control({
      x: 0.5,
      y: 0,
      actionHandler: isTextbox ? controlsUtils.changeWidth : controlsUtils.scalingXOrSkewingY,
      cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
      actionName: isTextbox ? 'resizing' : undefined,
      getActionName: isTextbox ? undefined : controlsUtils.scaleOrSkewActionName,
      render: renderCanvaSidePillControl,
      sizeX: CANVA_THEME.sidePillWidth + 4,
      sizeY: CANVA_THEME.sidePillHeight + 4,
      touchSizeX: 24,
      touchSizeY: 28,
    }),

    // Top & Bottom Horizontal Pill Handles (Height Resizing & Expansion)
    mt: new Control({
      x: 0,
      y: -0.5,
      actionHandler: controlsUtils.scalingYOrSkewingX,
      cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
      getActionName: controlsUtils.scaleOrSkewActionName,
      render: renderCanvaTopBottomPillControl,
      sizeX: CANVA_THEME.topPillWidth + 4,
      sizeY: CANVA_THEME.topPillHeight + 4,
      touchSizeX: 28,
      touchSizeY: 24,
    }),
    mb: new Control({
      x: 0,
      y: 0.5,
      actionHandler: controlsUtils.scalingYOrSkewingX,
      cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
      getActionName: controlsUtils.scaleOrSkewActionName,
      render: renderCanvaTopBottomPillControl,
      sizeX: CANVA_THEME.topPillWidth + 4,
      sizeY: CANVA_THEME.topPillHeight + 4,
      touchSizeX: 28,
      touchSizeY: 24,
    }),

    // Bottom Action Button: Rotate
    rotate: new Control({
      x: 0,
      y: 0.5,
      offsetX: -CANVA_THEME.actionButtonSpacing,
      offsetY: CANVA_THEME.actionButtonOffsetY,
      actionHandler: controlsUtils.rotationWithSnapping,
      cursorStyleHandler: controlsUtils.rotationStyleHandler,
      actionName: 'rotate',
      withConnection: false,
      render: renderCanvaRotateButton,
      sizeX: CANVA_THEME.actionButtonSize,
      sizeY: CANVA_THEME.actionButtonSize,
      touchSizeX: CANVA_THEME.actionButtonSize + 8,
      touchSizeY: CANVA_THEME.actionButtonSize + 8,
    }),

    // Bottom Action Button: Move / Drag
    drag: new Control({
      x: 0,
      y: 0.5,
      offsetX: CANVA_THEME.actionButtonSpacing,
      offsetY: CANVA_THEME.actionButtonOffsetY,
      actionHandler: controlsUtils.dragHandler,
      cursorStyleHandler: () => 'move',
      actionName: 'drag',
      withConnection: false,
      render: renderCanvaMoveButton,
      sizeX: CANVA_THEME.actionButtonSize,
      sizeY: CANVA_THEME.actionButtonSize,
      touchSizeX: CANVA_THEME.actionButtonSize + 8,
      touchSizeY: CANVA_THEME.actionButtonSize + 8,
    }),
  };
}

/**
 * Specialized Canva-style controls for horizontal lines, dividers, and rules:
 * - Only left (ml) and right (mr) side pill handles for width resizing
 * - Centered move/drag button below the line
 * - No rotate control (divider rules should never rotate into diagonal/curling angles)
 * - No corner controls (prevents overlapping handle clashing on thin 1-3px lines)
 */
export function createCanvaLineControls(): Record<string, Control> {
  return {
    ml: new Control({
      x: -0.5,
      y: 0,
      actionHandler: controlsUtils.scalingXOrSkewingY,
      cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
      getActionName: controlsUtils.scaleOrSkewActionName,
      render: renderCanvaSidePillControl,
      sizeX: CANVA_THEME.sidePillWidth + 4,
      sizeY: CANVA_THEME.sidePillHeight + 4,
      touchSizeX: 24,
      touchSizeY: 28,
    }),
    mr: new Control({
      x: 0.5,
      y: 0,
      actionHandler: controlsUtils.scalingXOrSkewingY,
      cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
      getActionName: controlsUtils.scaleOrSkewActionName,
      render: renderCanvaSidePillControl,
      sizeX: CANVA_THEME.sidePillWidth + 4,
      sizeY: CANVA_THEME.sidePillHeight + 4,
      touchSizeX: 24,
      touchSizeY: 28,
    }),
    drag: new Control({
      x: 0,
      y: 0.5,
      offsetX: 0, // Centered directly below the divider line
      offsetY: 20,
      actionHandler: controlsUtils.dragHandler,
      cursorStyleHandler: () => 'move',
      actionName: 'drag',
      withConnection: false,
      render: renderCanvaMoveButton,
      sizeX: CANVA_THEME.actionButtonSize,
      sizeY: CANVA_THEME.actionButtonSize,
      touchSizeX: CANVA_THEME.actionButtonSize + 8,
      touchSizeY: CANVA_THEME.actionButtonSize + 8,
    }),
  };
}

/**
 * Applies Canva selection styling (purple border, custom controls, no top mtr) to any object.
 * Automatically detects horizontal divider rules and lines to apply lockRotation and specialized line controls.
 */
export function applyCanvaSelectionStyle(obj: any) {
  if (!obj) return;
  const isText = obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text';
  const isLine = obj.type === 'line' ||
    obj.isDivider === true ||
    (obj.type === 'rect' && (
      (obj.height <= 4 && (obj.width || 0) >= 40) ||
      (typeof obj.id === 'string' && (
        obj.id.startsWith('hdr-div') ||
        obj.id.startsWith('hdr-dbl') ||
        obj.id.includes('line') ||
        obj.id.includes('accent')
      ))
    ));

  if (isLine) {
    obj.set({
      borderColor: CANVA_THEME.borderColor,
      borderScaleFactor: 1.5,
      borderOpacityWhenMoving: 1,
      borderDashArray: null,
      cornerColor: CANVA_THEME.cornerColor,
      cornerStrokeColor: CANVA_THEME.cornerStrokeColor,
      cornerStyle: 'circle',
      cornerSize: CANVA_THEME.cornerSize,
      transparentCorners: false,
      padding: 6,
      lockRotation: true,
      lockScalingY: true,
      hasRotatingPoint: false,
    });
    obj.controls = createCanvaLineControls();
    return;
  }

  obj.set({
    borderColor: CANVA_THEME.borderColor,
    borderScaleFactor: 1.5,
    borderOpacityWhenMoving: 1,
    borderDashArray: null,
    cornerColor: CANVA_THEME.cornerColor,
    cornerStrokeColor: CANVA_THEME.cornerStrokeColor,
    cornerStyle: 'circle',
    cornerSize: CANVA_THEME.cornerSize,
    transparentCorners: false,
    padding: 0,
  });
  obj.controls = createCanvaControls(isText);
}

/**
 * Initializes global Canva control defaults on Fabric prototypes.
 */
let isInitialized = false;
export function initCanvaGlobals() {
  if (isInitialized) return;
  isInitialized = true;

  const configureDefaults = (cls: any) => {
    if (!cls) return;
    if (cls.ownDefaults) {
      cls.ownDefaults.borderColor = CANVA_THEME.borderColor;
      cls.ownDefaults.borderScaleFactor = 1.5;
      cls.ownDefaults.borderOpacityWhenMoving = 1;
      cls.ownDefaults.borderDashArray = null;
      cls.ownDefaults.cornerColor = CANVA_THEME.cornerColor;
      cls.ownDefaults.cornerStrokeColor = CANVA_THEME.cornerStrokeColor;
      cls.ownDefaults.cornerStyle = 'circle';
      cls.ownDefaults.cornerSize = CANVA_THEME.cornerSize;
      cls.ownDefaults.transparentCorners = false;
      cls.ownDefaults.padding = 0;
    }
  };

  try {
    configureDefaults(InteractiveFabricObject);
    configureDefaults(FabricObject);
    configureDefaults(Textbox);
    configureDefaults(ActiveSelection);
    configureDefaults(Group);

    if (InteractiveFabricObject) {
      (InteractiveFabricObject as any).createControls = () => ({
        controls: createCanvaControls(false),
      });
    }

    if (FabricObject) {
      (FabricObject as any).createControls = () => ({
        controls: createCanvaControls(false),
      });
    }

    if (Textbox) {
      (Textbox as any).createControls = () => ({
        controls: createCanvaControls(true),
      });
    }

    if (ActiveSelection) {
      (ActiveSelection as any).createControls = () => ({
        controls: createCanvaControls(false),
      });
    }

    if (Group) {
      (Group as any).createControls = () => ({
        controls: createCanvaControls(false),
      });
    }
  } catch (err) {
    console.warn('Could not initialize Canva globals on Fabric prototypes:', err);
  }
}

/**
 * Renders a clean Canva purple hover outline around an unselected component.
 */
export function renderCanvaHoverOutline(ctx: CanvasRenderingContext2D, obj: any) {
  if (!obj || obj.visible === false) return;
  try {
    if (typeof obj._renderControls === 'function') {
      obj._renderControls(ctx, {
        hasBorders: true,
        hasControls: false,
        borderColor: CANVA_THEME.borderColor,
        borderScaleFactor: 1.5,
        borderDashArray: null,
      });
      return;
    }
  } catch {
    // Fall back to manual bounding box if needed
  }

  try {
    const vpt = obj.canvas?.viewportTransform || [1, 0, 0, 1, 0, 0];
    const m = obj.calcTransformMatrix ? obj.calcTransformMatrix() : null;
    if (!m) return;

    const finalM = util?.multiplyTransformMatrices ? util.multiplyTransformMatrices(vpt, m) : m;
    const opt = util?.qrDecompose ? util.qrDecompose(finalM) : { translateX: obj.left || 0, translateY: obj.top || 0, angle: obj.angle || 0 };

    const w = (obj.width || 0) * (obj.scaleX || 1);
    const h = (obj.height || 0) * (obj.scaleY || 1);

    ctx.save();
    ctx.translate(opt.translateX, opt.translateY);
    ctx.rotate((opt.angle * Math.PI) / 180);
    ctx.strokeStyle = CANVA_THEME.borderColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  } catch {}
}

