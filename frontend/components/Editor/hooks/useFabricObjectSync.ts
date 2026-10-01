import { useEffect, useRef, MutableRefObject } from 'react';
import { Canvas, Circle, ActiveSelection } from 'fabric';
import { useStore } from '../../../store/useStore';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../../constants';
import { CatalogPage, CanvasElement } from '../../../types';
import { elementToFabricObject, applyTextEffectsToFabricObject } from '../fabricRenderer';
import { SpatialIndex } from '../../../utils/spatialIndex';
import { applyCanvaSelectionStyle } from '../../../utils/canvaControls';
import { resolveDynamicText, getPageCategoryName } from '../../../utils/dynamicTags';

interface UseFabricObjectSyncProps {
  canvas: Canvas | null;
  page: CatalogPage;
  pageIdx: number;
  isActive: boolean;
  editingId: string | null;
  activeCropElementId: string | null;
  canvasBg: string;
  headerElements: CanvasElement[];
  footerElements: CanvasElement[];
  footerHeight: number;
  spatialIndexRef: MutableRefObject<SpatialIndex>;
  suppressSelectionClearedRef: MutableRefObject<boolean>;
  isActiveRef: MutableRefObject<boolean>;
}

export const useFabricObjectSync = ({
  canvas,
  page,
  pageIdx,
  isActive,
  editingId,
  activeCropElementId,
  canvasBg,
  headerElements,
  footerElements,
  footerHeight,
  spatialIndexRef,
  suppressSelectionClearedRef,
  isActiveRef,
}: UseFabricObjectSyncProps) => {
  const catalog = useStore((state) => state.catalog);
  const products = useStore((state) => state.products);
  const categories = useStore((state) => state.categories);
  const user = useStore((state) => state.user);

  const renderVersionRef = useRef(0);

  // Sync store selection changes to Fabric canvas (Active page only)
  useEffect(() => {
    const unsub = useStore.subscribe((newState, prevState) => {
      if (!isActiveRef.current || !canvas) return;

      const newIds = newState.selectedElementIds || [];
      const oldIds = prevState?.selectedElementIds || [];

      if (newIds !== oldIds) {
        const currentActiveIds = canvas.getActiveObjects().map((o: any) => o.id).filter(Boolean);
        if (newIds.length === 0) {
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        } else if (
          JSON.stringify(currentActiveIds.sort()) !== JSON.stringify([...newIds].sort())
        ) {
          if ((canvas as any)._currentTransform) return;
          canvas.discardActiveObject();
          const objsToSelect = canvas.getObjects().filter((o: any) => newIds.includes(o.id));
          if (objsToSelect.length === 1) {
            canvas.setActiveObject(objsToSelect[0]);
          } else if (objsToSelect.length > 1) {
            const sel = new ActiveSelection(objsToSelect, { canvas });
            canvas.setActiveObject(sel);
          }
          canvas.requestRenderAll();
        }
      }
    });
    return unsub;
  }, [canvas]);

  // Main Fabric object rendering & diffing cycle
  useEffect(() => {
    if (!canvas) return;

    const currentVersion = ++renderVersionRef.current;

    const loadObjects = async () => {
      if ((canvas as any)._currentTransform) return;
      if (currentVersion !== renderVersionRef.current) return;

      suppressSelectionClearedRef.current = true;
      const preSelectedIds = useStore.getState().selectedElementIds || [];
      try {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
          canvas.discardActiveObject();
        }

        const existingObjects = canvas.getObjects();
        const effectiveFooterHeight = catalog.footerHeight || footerHeight || 75.6;
        const footerBaseY = PAGE_HEIGHT - effectiveFooterHeight;

        const pageCategory = getPageCategoryName(page, categories, products, catalog);
        const dynamicContext = {
          pageNumber: page.pageNumber || pageIdx + 1,
          totalPages: catalog.pages?.length || 1,
          catalogName: catalog.name || 'Catalog',
          categoryName: pageCategory,
          companyName: (user as any)?.businessName || catalog.company || 'V-TAC',
          year: new Date().getFullYear(),
        };

        const formattedFooterElements = (footerElements || []).map((el: any) => {
          const isFullBg =
            el.id?.startsWith('ftr-bg') ||
            (el.type === 'shape' &&
              (el.width || 0) >= 700 &&
              (el.height || 0) >= effectiveFooterHeight - 5);
          return {
            ...el,
            height: isFullBg ? effectiveFooterHeight : el.height,
            y: (el.y || 0) > 500 ? el.y : (el.y || 0) + footerBaseY,
            text:
              el.type === 'text' ? resolveDynamicText(el.text, dynamicContext) : el.text,
          };
        });

        const formattedHeaderElements = (headerElements || []).map((el: any) => ({
          ...el,
          text:
            el.type === 'text' ? resolveDynamicText(el.text, dynamicContext) : el.text,
        }));

        const allElements = [
          ...page.elements,
          ...formattedHeaderElements,
          ...formattedFooterElements,
        ];

        // Ensure all fonts used across elements are loaded in browser
        if (typeof document !== 'undefined' && document.fonts) {
          const fontsToWait = new Set<string>();
          allElements.forEach((el: any) => {
            const f = el.fontFamily || (catalog as any)?.fontFamily;
            if (f) fontsToWait.add(f);
          });
          if (fontsToWait.size > 0) {
            try {
              await Promise.all(
                Array.from(fontsToWait).map((f) => document.fonts.load(`16px "${f}"`))
              );
            } catch {}
          }
        }
        const elIds = new Set(allElements.map((e) => e.id));

        existingObjects.forEach((obj: any) => {
          if (obj.id && !elIds.has(obj.id)) {
            canvas.remove(obj);
          }
        });

        const existingElMap = new Map<string, any>();
        existingObjects.forEach((o: any) => {
          if (o.id) existingElMap.set(o.id, o);
        });

        const needsRebuild = (el: CanvasElement, existingObj: any) => {
          if (el.type === 'text') {
            const oldFill = existingObj._lastFill || '';
            const newFill = el.fill || '';
            const oldIsGrad = oldFill.includes('gradient');
            const newIsGrad = newFill.includes('gradient');
            if (oldIsGrad !== newIsGrad || (newIsGrad && oldFill !== newFill)) {
              return true;
            }
            return false;
          }
          if (el.type === 'table') {
            const oldTableJSON = existingObj._tableDataJSON;
            const newTableJSON = JSON.stringify(el.tableData || {});
            const oldW = (existingObj.width || 1) * Math.abs(existingObj.scaleX || 1);
            const oldH = (existingObj.height || 1) * Math.abs(existingObj.scaleY || 1);
            return (
              existingObj._rendererVersion !== 4 ||
              oldTableJSON !== newTableJSON ||
              Math.abs(el.width - oldW) > 2 ||
              Math.abs(el.height - oldH) > 2 ||
              Math.abs((existingObj.scaleX || 1) - 1) > 0.05
            );
          }
          if (el.type === 'shape' || el.type === 'comment') {
            const oldFill = existingObj._lastFill || existingObj.fill || '';
            const newFill = el.fill || '';
            const oldStroke = existingObj.stroke || '';
            const newStroke = el.stroke || '';
            const oldShapeType = existingObj._shapeType || '';
            const newShapeType = el.shapeType || '';
            const oldH = (existingObj.height || 0) * (existingObj.scaleY || 1);
            const oldW = (existingObj.width || 0) * (existingObj.scaleX || 1);
            if (
              oldShapeType !== newShapeType ||
              oldFill !== newFill ||
              oldStroke !== newStroke ||
              Math.abs(el.height - oldH) > 1 ||
              Math.abs(el.width - oldW) > 1
            ) {
              return true;
            }
            return false;
          }
          if (el.type !== 'product-block') return false;

          const isScaled =
            Math.abs((existingObj.scaleX || 1) - 1) > 0.01 ||
            Math.abs((existingObj.scaleY || 1) - 1) > 0.01;
          const renderedW = existingObj._renderedWidth || existingObj.width || 1;
          const renderedH = existingObj._renderedHeight || existingObj.height || 1;
          if (
            isScaled ||
            Math.abs(el.width - renderedW) > 2 ||
            Math.abs(el.height - renderedH) > 2
          ) {
            return true;
          }

          const oldFill = existingObj._fill || '';
          const newFill = el.fill || '';
          const oldStroke = existingObj._stroke || '';
          const newStroke = el.stroke || '';
          const oldStrokeWidth = existingObj._strokeWidth;
          const newStrokeWidth = el.strokeWidth;
          if (
            oldFill !== newFill ||
            oldStroke !== newStroke ||
            oldStrokeWidth !== newStrokeWidth
          ) {
            return true;
          }

          const oldShowTitle = existingObj._showTitle ?? true;
          const oldShowPrice = existingObj._showPrice ?? true;
          const oldShowSKU = existingObj._showSKU ?? true;
          const oldVisibleParamsJSON = existingObj._visibleParamsJSON || '';
          const newShowTitle = catalog.showTitle !== false;
          const newShowPrice = catalog.showPrice !== false;
          const newShowSKU = catalog.showSKU !== false;
          const prodObj = products.find((p) => p.id === el.productId);
          const catId = prodObj?.categoryId ? String(prodObj.categoryId) : '';
          const newVisibleParamsJSON = JSON.stringify(
            (catId &&
              (catalog.categoryVisibleParams?.[catId] ||
                catalog.categoryVisibleParams?.[prodObj?.categoryId as string] ||
                Object.entries(catalog.categoryVisibleParams || {}).find(
                  ([k]) => String(k) === catId
                )?.[1])) ||
              []
          );

          const oldFontFamily = existingObj._fontFamily || '';
          const oldCardTheme = existingObj._cardTheme || '';
          const newFontFamily = (el as any).fontFamily || (catalog as any).fontFamily || '';
          const newCardTheme = (el as any).cardTheme || '';

          const hasCustomChanges =
            existingObj._customTitle !== el.customTitle ||
            existingObj._customPrice !== el.customPrice ||
            existingObj._customSku !== el.customSku ||
            existingObj._customDesc !== el.customDesc ||
            existingObj._titleFontSize !== el.titleFontSize ||
            existingObj._priceFontSize !== el.priceFontSize ||
            existingObj._fontSize !== el.fontSize ||
            existingObj._titleColor !== el.titleColor ||
            existingObj._priceColor !== el.priceColor ||
            existingObj._textColor !== el.textColor ||
            existingObj._fill !== (el.fill || '') ||
            existingObj._stroke !== (el.stroke || '') ||
            existingObj._cardTheme !== ((el as any).cardTheme || '') ||
            existingObj._borderRadius !== (el as any).borderRadius ||
            existingObj._visibleFieldKeysJSON !== JSON.stringify(el.visibleFieldKeys || []) ||
            existingObj._fieldOverridesJSON !== JSON.stringify(el.fieldOverrides || {});

          if (hasCustomChanges) return true;

          return (
            el.productId !== existingObj._productId ||
            el.src !== existingObj._src ||
            oldShowTitle !== newShowTitle ||
            oldShowPrice !== newShowPrice ||
            oldShowSKU !== newShowSKU ||
            oldVisibleParamsJSON !== newVisibleParamsJSON ||
            oldFontFamily !== newFontFamily ||
            oldCardTheme !== newCardTheme
          );
        };

        const getEffectiveZIndex = (el: CanvasElement, idx: number) => {
          const isHdr = headerElements?.some((h) => h.id === el.id);
          if (isHdr) {
            return 1000 + (el.zIndex !== undefined ? el.zIndex : idx);
          }
          const isFtr = footerElements?.some((f) => f.id === el.id);
          if (isFtr) {
            return 2000 + (el.zIndex !== undefined ? el.zIndex : idx);
          }
          return el.zIndex !== undefined ? el.zIndex : idx;
        };

        const objectPromises = allElements.map(async (el: CanvasElement, elIdx: number) => {
          try {
            const isHdr = headerElements?.some((h) => h.id === el.id);
            const isFtr = footerElements?.some((f) => f.id === el.id);
            const isLockedGlobal = isHdr || isFtr;
            const existingObj = existingElMap.get(el.id);

            if (existingObj) {
              const isActiveObj = canvas.getActiveObjects().includes(existingObj);
              const isTableRebuild = el.type === 'table' && needsRebuild(el, existingObj);
              const isProductRebuild =
                el.type === 'product-block' && needsRebuild(el, existingObj);
              const isShapeRebuild =
                (el.type === 'shape' || el.type === 'comment') &&
                needsRebuild(el, existingObj);
              const isImageRebuild =
                el.type === 'image' &&
                (el.src !== (existingObj as any)._src ||
                  el.cropX !== (existingObj as any).cropX ||
                  el.cropY !== (existingObj as any).cropY ||
                  el.cropWidth !== (existingObj as any).cropWidth ||
                  el.cropHeight !== (existingObj as any).cropHeight ||
                  Boolean(el.overlayEnabled) !==
                    Boolean((existingObj as any)._overlayEnabled) ||
                  el.overlayType !== (existingObj as any)._overlayType ||
                  el.overlayColor !== (existingObj as any)._overlayColor ||
                  el.overlayOpacity !== (existingObj as any)._overlayOpacity ||
                  el.overlayGradientDirection !==
                    (existingObj as any)._overlayGradientDirection ||
                  el.overlayGradientStartColor !==
                    (existingObj as any)._overlayGradientStartColor ||
                  el.overlayGradientEndColor !==
                    (existingObj as any)._overlayGradientEndColor ||
                  el.overlayGradientStartOpacity !==
                    (existingObj as any)._overlayGradientStartOpacity ||
                  el.overlayGradientEndOpacity !==
                    (existingObj as any)._overlayGradientEndOpacity ||
                  (existingObj as any)._wasCropActive === true);
              const isVideoRebuild =
                el.type === 'video' &&
                (el.videoUrl !== (existingObj as any)._videoUrl ||
                  el.videoPoster !== (existingObj as any)._videoPoster);

              if (
                isTableRebuild ||
                isProductRebuild ||
                isShapeRebuild ||
                isImageRebuild ||
                isVideoRebuild
              ) {
                if (isActiveObj) {
                  canvas.discardActiveObject();
                }
                canvas.remove(existingObj);
              } else {
                const isCurrentlyEditing =
                  isActive && (el.id === editingId || el.id === activeCropElementId);
                if (isCurrentlyEditing && el.type === 'image') {
                  (existingObj as any)._wasCropActive = true;
                }
                existingObj.set({
                  opacity: isCurrentlyEditing ? 0 : el.opacity ?? 1,
                  visible: isCurrentlyEditing ? false : el.visible !== false,
                  selectable:
                    !isLockedGlobal && isActive && !el.locked && !isCurrentlyEditing,
                  evented: !isLockedGlobal && isActive && !el.locked && !isCurrentlyEditing,
                });

                if (isLockedGlobal) {
                  existingObj.set({
                    hasControls: false,
                    hasBorders: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    lockRotation: true,
                    lockScalingX: true,
                    lockScalingY: true,
                    hoverCursor: 'default',
                  });
                } else {
                  applyCanvaSelectionStyle(existingObj);
                }

                if (!isActiveObj) {
                  existingObj.set({ left: el.x, top: el.y, angle: el.rotation || 0 });
                }

                if (el.type === 'text') {
                  let parsedText = resolveDynamicText(
                    String(el.text ?? '').replace(/<[^>]*>/g, ''),
                    dynamicContext
                  );
                  const is3GridTitle = Boolean(
                    (el.sectionTag &&
                      (el.id?.includes('title') || (el.fontSize && el.fontSize >= 18))) ||
                      (el.fill === '#00a651' && (el.fontSize && el.fontSize >= 18))
                  );
                  const resolvedFont = is3GridTitle
                    ? el.fontFamily === 'Montserrat' ||
                      el.fontFamily === 'Inter' ||
                      !el.fontFamily
                      ? 'Bebas Neue, Oswald, sans-serif'
                      : el.fontFamily
                    : el.fontFamily || catalog?.fontFamily || 'Inter';

                  existingObj.set({
                    text: is3GridTitle ? parsedText.toUpperCase() : parsedText,
                    fontSize: el.fontSize || 16,
                    fontFamily: resolvedFont,
                    fontWeight: is3GridTitle ? 'normal' : el.fontWeight || 'normal',
                    fontStyle: el.fontStyle || 'normal',
                    textAlign: el.textAlign || 'left',
                    lineHeight: el.lineHeight || 1.2,
                    underline: el.textDecoration?.includes('underline') || false,
                    charSpacing: el.letterSpacing
                      ? Math.round((el.letterSpacing / (el.fontSize || 16)) * 1000)
                      : 0,
                    objectCaching: false,
                  });
                  applyTextEffectsToFabricObject(existingObj, el);
                  existingObj._lastFill = el.fill || '';
                  if (!isActiveObj) {
                    let safeW = el.width || 100;
                    if (!el.width && !parsedText.includes('\n')) {
                      const naturalW = (existingObj as any).calcTextWidth
                        ? (existingObj as any).calcTextWidth()
                        : 0;
                      if (naturalW > 0) {
                        safeW = Math.ceil(naturalW + 10);
                      }
                    }
                    existingObj.set({
                      width: safeW,
                      scaleX: 1,
                      scaleY: 1,
                    });
                  }
                  if (existingObj.initDimensions) {
                    existingObj.initDimensions();
                  }
                  existingObj.dirty = true;
                } else if (el.type === 'shape' || el.type === 'comment') {
                  existingObj.set({
                    fill: el.fill || '#ffffff',
                    stroke:
                      el.stroke && el.stroke !== 'transparent' ? el.stroke : undefined,
                    strokeWidth:
                      el.stroke && el.stroke !== 'transparent' ? el.strokeWidth || 2 : 0,
                  });
                  if (!isActiveObj) {
                    existingObj.set({
                      width: el.width,
                      height: el.height,
                      scaleX: 1,
                      scaleY: 1,
                    });
                    if (el.shapeType === 'circle' && existingObj instanceof Circle) {
                      existingObj.set({ radius: Math.min(el.width, el.height) / 2 });
                    }
                  }
                } else if (el.type === 'video') {
                  existingObj.set({
                    stroke:
                      el.stroke && el.stroke !== 'transparent' ? el.stroke : undefined,
                    strokeWidth:
                      el.stroke && el.stroke !== 'transparent' ? el.strokeWidth || 2 : 0,
                    objectCaching: false,
                  });
                  if (!isActiveObj) {
                    existingObj.set({
                      width: el.width,
                      height: el.height,
                      scaleX: 1,
                      scaleY: 1,
                    });
                  }
                } else if (el.type === 'image') {
                  existingObj.set({
                    stroke:
                      el.stroke && el.stroke !== 'transparent' ? el.stroke : undefined,
                    strokeWidth:
                      el.stroke && el.stroke !== 'transparent' ? el.strokeWidth || 2 : 0,
                    objectCaching: false,
                  });
                  (existingObj as any).cropX = el.cropX;
                  (existingObj as any).cropY = el.cropY;
                  (existingObj as any).cropWidth = el.cropWidth;
                  (existingObj as any).cropHeight = el.cropHeight;
                  if (el.naturalWidth) (existingObj as any).naturalWidth = el.naturalWidth;
                  if (el.naturalHeight) (existingObj as any).naturalHeight = el.naturalHeight;

                  if (
                    (existingObj as any)._objects &&
                    (existingObj as any)._objects.length > 0
                  ) {
                    const baseImg = (existingObj as any)._objects[0];
                    if (baseImg) {
                      baseImg.set({
                        width: el.width,
                        height: el.height,
                        objectCaching: false,
                      });
                      baseImg.cropX = el.cropX;
                      baseImg.cropY = el.cropY;
                      baseImg.cropWidth = el.cropWidth;
                      baseImg.cropHeight = el.cropHeight;
                      if (el.naturalWidth) baseImg.naturalWidth = el.naturalWidth;
                      if (el.naturalHeight) baseImg.naturalHeight = el.naturalHeight;
                      baseImg.dirty = true;
                    }
                    const overlayRect = (existingObj as any)._objects[1];
                    if (overlayRect) {
                      overlayRect.set({
                        width: el.width,
                        height: el.height,
                        rx: el.borderRadius || 0,
                        ry: el.borderRadius || 0,
                      });
                      overlayRect.dirty = true;
                    }
                  }

                  if (!isActiveObj) {
                    existingObj.set({
                      left: el.x,
                      top: el.y,
                      angle: el.rotation || 0,
                      width: el.width,
                      height: el.height,
                      scaleX: 1,
                      scaleY: 1,
                    });
                    existingObj.setCoords();
                  }
                  existingObj.dirty = true;
                } else if (el.type === 'product-block') {
                  existingObj._productId = el.productId;
                  existingObj._src = el.src;
                  existingObj._fill = el.fill || '';
                  existingObj._stroke = el.stroke || '';
                  existingObj._strokeWidth = el.strokeWidth;
                  existingObj._cardTheme = (el as any).cardTheme || '';

                  const baseCardRect = (existingObj as any)._objects?.[0];
                  if (baseCardRect) {
                    const cardFill = el.fill || '#ffffff';
                    const cardStroke =
                      el.stroke && el.stroke !== 'transparent' ? el.stroke : '#e2e8f0';
                    const cardStrokeWidth =
                      el.stroke && el.stroke !== 'transparent'
                        ? el.strokeWidth !== undefined
                          ? el.strokeWidth
                          : 2
                        : el.stroke === 'transparent'
                        ? 0
                        : 1.5;
                    baseCardRect.set({
                      fill: cardFill,
                      stroke: cardStroke,
                      strokeWidth: cardStrokeWidth,
                    });
                  }

                  if (!isActiveObj) {
                    existingObj.set({
                      left: el.x,
                      top: el.y,
                      angle: el.rotation || 0,
                      scaleX: 1,
                      scaleY: 1,
                    });
                  }
                  existingObj.set('zIndex', getEffectiveZIndex(el, elIdx));
                  existingObj.setCoords();
                  existingObj.dirty = true;
                  return existingObj;
                }

                existingObj.set('zIndex', getEffectiveZIndex(el, elIdx));
                existingObj._groupId = el.groupId || undefined;
                existingObj.setCoords();
                existingObj.dirty = true;
                return existingObj;
              }
            }

            const tempEl = { ...el };
            if (
              tempEl.type === 'text' &&
              tempEl.text !== undefined &&
              tempEl.text !== null
            ) {
              tempEl.text = resolveDynamicText(String(tempEl.text), dynamicContext);
            }
            const obj = await elementToFabricObject(tempEl, products, catalog);
            if (obj) {
              const isCurrentlyEditing =
                isActive && (el.id === editingId || el.id === activeCropElementId);
              obj.set('zIndex', getEffectiveZIndex(el, elIdx));
              obj.set({
                opacity: isCurrentlyEditing ? 0 : el.opacity ?? 1,
                visible: isCurrentlyEditing ? false : el.visible !== false,
                selectable:
                  !isLockedGlobal && isActive && !el.locked && !isCurrentlyEditing,
                evented: !isLockedGlobal && isActive && !el.locked && !isCurrentlyEditing,
              });
              if (isLockedGlobal) {
                obj.set({
                  hasControls: false,
                  hasBorders: false,
                  lockMovementX: true,
                  lockMovementY: true,
                  lockRotation: true,
                  lockScalingX: true,
                  lockScalingY: true,
                  hoverCursor: 'default',
                });
              } else {
                applyCanvaSelectionStyle(obj);
              }
              if (el.type === 'product-block') {
                obj._renderedWidth = el.width;
                obj._renderedHeight = el.height;
                obj._productId = el.productId;
                obj._src = el.src;
                obj._fill = el.fill || '';
                obj._stroke = el.stroke || '';
                obj._strokeWidth = el.strokeWidth;
                obj._customTitle = el.customTitle;
                obj._customPrice = el.customPrice;
                obj._customSku = el.customSku;
                obj._customDesc = el.customDesc;
                obj._titleFontSize = el.titleFontSize;
                obj._priceFontSize = el.priceFontSize;
                obj._fontSize = el.fontSize;
                obj._titleColor = el.titleColor;
                obj._priceColor = el.priceColor;
                obj._textColor = el.textColor;
                obj._borderRadius = (el as any).borderRadius;
                obj._showTitle = catalog.showTitle !== false;
                obj._showPrice = catalog.showPrice !== false;
                obj._showSKU = catalog.showSKU !== false;
                const prod = products.find((p) => p.id === el.productId);
                const catId = prod?.categoryId ? String(prod.categoryId) : '';
                obj._visibleParamsJSON = JSON.stringify(
                  (catId &&
                    Object.entries(catalog.categoryVisibleParams || {}).find(
                      ([k]) => String(k) === catId
                    )?.[1]) ||
                    []
                );
                obj._fontFamily =
                  (el as any).fontFamily || (catalog as any).fontFamily || '';
                obj._cardTheme = (el as any).cardTheme || '';
                obj._visibleFieldKeysJSON = JSON.stringify(el.visibleFieldKeys || []);
                obj._fieldOverridesJSON = JSON.stringify(el.fieldOverrides || {});
              } else if (el.type === 'table') {
                obj._tableDataJSON = JSON.stringify(el.tableData || {});
              } else if (el.type === 'text') {
                obj._lastFill = el.fill || '';
              } else if (el.type === 'shape' || el.type === 'comment') {
                obj._shapeType = el.shapeType || '';
              }
              obj._groupId = el.groupId || undefined;
            }
            return obj;
          } catch (itemErr) {
            console.error(`Error rendering element ${el.id} (${el.type}):`, itemErr);
            return null;
          }
        });

        const resolvedObjects = await Promise.all(objectPromises);
        if (currentVersion !== renderVersionRef.current) return;

        const validObjects = resolvedObjects.filter(Boolean);
        const currentCanvasObjects = canvas.getObjects();

        const validIdSet = new Set<string>();
        validObjects.forEach((obj: any) => {
          if (obj.id) validIdSet.add(obj.id);
        });

        currentCanvasObjects.forEach((canvasObj: any) => {
          if (
            canvasObj.id &&
            validIdSet.has(canvasObj.id) &&
            !validObjects.includes(canvasObj)
          ) {
            canvas.remove(canvasObj);
          }
        });

        validObjects.forEach((obj) => {
          applyCanvaSelectionStyle(obj);
          if (!canvas.getObjects().includes(obj)) {
            canvas.add(obj);
          }
        });

        const freshSelectedIds = useStore.getState().selectedElementIds || [];
        const targetSelectedIds = (
          freshSelectedIds.length > 0 ? freshSelectedIds : preSelectedIds
        ).filter((id) => id !== editingId);
        if (isActive && targetSelectedIds.length > 0) {
          const selectedObjs = validObjects.filter(
            (o: any) => o && o.id && targetSelectedIds.includes(o.id)
          );
          const currentActive = canvas.getActiveObjects();
          if (
            selectedObjs.length > 0 &&
            (!currentActive.length || !selectedObjs.every((o) => currentActive.includes(o)))
          ) {
            if (selectedObjs.length === 1) {
              applyCanvaSelectionStyle(selectedObjs[0]);
              canvas.setActiveObject(selectedObjs[0]);
            } else if (selectedObjs.length > 1) {
              const sel = new ActiveSelection(selectedObjs, { canvas });
              applyCanvaSelectionStyle(sel);
              canvas.setActiveObject(sel);
            }
          }
          if (
            JSON.stringify(useStore.getState().selectedElementIds) !==
            JSON.stringify(targetSelectedIds)
          ) {
            useStore.getState().setSelectedElementIds(targetSelectedIds);
          }
        }

        spatialIndexRef.current.clear();
        const boxes = validObjects
          .map((obj: any) => {
            const w = (obj.width || 0) * (obj.scaleX || 1);
            const h = (obj.height || 0) * (obj.scaleY || 1);
            return {
              id: obj.id || '',
              minX: obj.left || 0,
              minY: obj.top || 0,
              maxX: (obj.left || 0) + w,
              maxY: (obj.top || 0) + h,
              zIndex: obj.get?.('zIndex') || 0,
            };
          })
          .filter((b) => !!b.id);
        spatialIndexRef.current.insertMany(boxes);

        canvas._objects.sort(
          (a: any, b: any) => (a.get('zIndex') || 0) - (b.get('zIndex') || 0)
        );

        canvas.backgroundColor = 'transparent';
        canvas.renderAll();

        if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => {
            if (currentVersion === renderVersionRef.current && canvas) {
              canvas.requestRenderAll();
            }
          });
        }
      } catch (err) {
        console.error('FabricStage render error:', err, (err as any)?.stack);
      } finally {
        suppressSelectionClearedRef.current = false;
      }
    };

    loadObjects();
  }, [
    canvas,
    page.elements,
    page.type,
    page.backgroundColor,
    canvasBg,
    headerElements,
    footerElements,
    footerHeight,
    catalog?.footerHeight,
    catalog?.marginBottom,
    isActive,
    editingId,
    activeCropElementId,
    products,
    pageIdx,
    page.pageNumber,
    catalog?.showTitle,
    catalog?.showPrice,
    catalog?.showSKU,
    catalog?.fontFamily,
    JSON.stringify(catalog?.categoryVisibleParams),
  ]);

  // Delayed fallback re-renders for custom web fonts
  useEffect(() => {
    const forceRender = () => {
      if (canvas) {
        canvas.getObjects().forEach((obj: any) => {
          obj.dirty = true;
          if (obj.type === 'group') {
            obj._objects?.forEach((child: any) => {
              child.dirty = true;
            });
          }
        });
        canvas.renderAll();
      }
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(forceRender);
    }

    const timer1 = setTimeout(forceRender, 200);
    const timer2 = setTimeout(forceRender, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [canvas]);
};
