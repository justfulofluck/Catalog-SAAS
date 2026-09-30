import { AppSlice, CropSlice } from '../types';

export const createCropSlice: AppSlice<CropSlice> = (set, get) => ({
  activeCropElementId: null,
  activeCropAspect: 'freeform',
  activeCropRotation: 0,
  activeCropOriginalState: null,

  startCropMode: (elementId: string) => {
    const { catalog, currentPageIndex } = get();
    const page = catalog.pages?.[currentPageIndex];
    const element =
      page?.elements?.find((el) => el.id === elementId) ||
      catalog.headerElements?.find((el) => el.id === elementId) ||
      catalog.footerElements?.find((el) => el.id === elementId);

    if (!element) return;

    let naturalW = element.naturalWidth || element.width || 1;
    let naturalH = element.naturalHeight || element.height || 1;

    if (element.src && (!element.naturalWidth || !element.naturalHeight)) {
      const img = new Image();
      img.src = element.src;
      if (img.complete && img.naturalWidth) {
        naturalW = img.naturalWidth;
        naturalH = img.naturalHeight;
      }
    }

    const curCropX = element.cropX !== undefined ? element.cropX : 0;
    const curCropY = element.cropY !== undefined ? element.cropY : 0;
    const curCropW = element.cropWidth !== undefined ? element.cropWidth : naturalW;
    const curCropH = element.cropHeight !== undefined ? element.cropHeight : naturalH;

    set({
      activeCropElementId: elementId,
      editorTab: 'crop',
      isSidebarExpanded: true,
      activeCropAspect: 'freeform',
      activeCropRotation: element.rotation || 0,
      activeCropOriginalState: {
        cropX: curCropX,
        cropY: curCropY,
        cropWidth: curCropW,
        cropHeight: curCropH,
        naturalWidth: naturalW,
        naturalHeight: naturalH,
        width: element.width,
        height: element.height,
        x: element.x,
        y: element.y,
        rotation: element.rotation || 0,
      },
    });
  },

  cancelCropMode: () => {
    const {
      activeCropOriginalState,
      activeCropElementId,
      currentPageIndex,
      updateElement,
      catalog,
      updateHeaderElement,
      updateFooterElement,
    } = get();
    if (activeCropElementId && activeCropOriginalState) {
      if (catalog.headerElements?.some((h) => h.id === activeCropElementId)) {
        updateHeaderElement(activeCropElementId, activeCropOriginalState);
      } else if (catalog.footerElements?.some((f) => f.id === activeCropElementId)) {
        updateFooterElement(activeCropElementId, activeCropOriginalState);
      } else {
        updateElement(currentPageIndex, activeCropElementId, activeCropOriginalState);
      }
    }
    set({
      activeCropElementId: null,
      activeCropOriginalState: null,
      editorTab: null,
    });
  },

  applyCropMode: () => {
    get().pushHistory();
    set({
      activeCropElementId: null,
      activeCropOriginalState: null,
      editorTab: null,
    });
  },

  setActiveCropAspect: (
    aspect: 'freeform' | 'original' | '1:1' | '16:9' | '4:3' | '3:2' | '2:3' | '9:16'
  ) => {
    const {
      activeCropElementId,
      catalog,
      currentPageIndex,
      updateElement,
      updateHeaderElement,
      updateFooterElement,
    } = get();
    if (!activeCropElementId) return;

    const page = catalog.pages?.[currentPageIndex];
    const element =
      page?.elements?.find((el) => el.id === activeCropElementId) ||
      catalog.headerElements?.find((el) => el.id === activeCropElementId) ||
      catalog.footerElements?.find((el) => el.id === activeCropElementId);

    if (!element) return;

    const nw = element.naturalWidth || element.width || 1;
    const nh = element.naturalHeight || element.height || 1;

    let targetRatio = 1;
    if (aspect === 'original') {
      targetRatio = nw / nh;
    } else if (aspect === '1:1') {
      targetRatio = 1;
    } else if (aspect === '16:9') {
      targetRatio = 16 / 9;
    } else if (aspect === '4:3') {
      targetRatio = 4 / 3;
    } else if (aspect === '3:2') {
      targetRatio = 3 / 2;
    } else if (aspect === '2:3') {
      targetRatio = 2 / 3;
    } else if (aspect === '9:16') {
      targetRatio = 9 / 16;
    }

    let newCropW = element.cropWidth || nw;
    let newCropH = element.cropHeight || nh;

    if (aspect !== 'freeform') {
      if (nw / nh > targetRatio) {
        newCropH = nh;
        newCropW = nh * targetRatio;
      } else {
        newCropW = nw;
        newCropH = nw / targetRatio;
      }
    }

    const newCropX = Math.max(0, Math.round((nw - newCropW) / 2));
    const newCropY = Math.max(0, Math.round((nh - newCropH) / 2));

    const scale = (element.width || 1) / (element.cropWidth || nw || 1);
    const newW = Math.round(newCropW * scale);
    const newH = Math.round(newCropH * scale);

    const updates = {
      cropX: newCropX,
      cropY: newCropY,
      cropWidth: Math.round(newCropW),
      cropHeight: Math.round(newCropH),
      width: newW,
      height: newH,
    };

    if (catalog.headerElements?.some((h) => h.id === activeCropElementId)) {
      updateHeaderElement(activeCropElementId, updates);
    } else if (catalog.footerElements?.some((f) => f.id === activeCropElementId)) {
      updateFooterElement(activeCropElementId, updates);
    } else {
      updateElement(currentPageIndex, activeCropElementId, updates);
    }

    set({ activeCropAspect: aspect });
  },

  setActiveCropRotation: (rotation: number) => {
    const {
      activeCropElementId,
      catalog,
      currentPageIndex,
      updateElement,
      updateHeaderElement,
      updateFooterElement,
    } = get();
    if (!activeCropElementId) return;

    if (catalog.headerElements?.some((h) => h.id === activeCropElementId)) {
      updateHeaderElement(activeCropElementId, { rotation });
    } else if (catalog.footerElements?.some((f) => f.id === activeCropElementId)) {
      updateFooterElement(activeCropElementId, { rotation });
    } else {
      updateElement(currentPageIndex, activeCropElementId, { rotation });
    }
    set({ activeCropRotation: rotation });
  },
});
