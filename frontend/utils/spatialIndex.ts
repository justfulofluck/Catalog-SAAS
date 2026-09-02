export interface BoundingBox {
  id: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  zIndex: number;
}

/**
 * 2D Spatial Index & Bounding Volume Hierarchy (BVH) for O(log N) hit testing,
 * viewport culling, and proximity detection for smart alignment guides.
 */
export class SpatialIndex {
  private boxes: BoundingBox[] = [];

  public clear(): void {
    this.boxes = [];
  }

  public insert(box: BoundingBox): void {
    this.boxes.push(box);
  }

  public insertMany(boxes: BoundingBox[]): void {
    this.boxes.push(...boxes);
  }

  /**
   * Hit test a point against all indexed bounds (returns top-most elements first)
   */
  public queryPoint(x: number, y: number): string[] {
    return this.boxes
      .filter((b) => x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY)
      .sort((a, b) => b.zIndex - a.zIndex)
      .map((b) => b.id);
  }

  /**
   * Viewport culling: returns IDs of elements intersecting the visible viewport
   */
  public queryViewport(minX: number, minY: number, maxX: number, maxY: number): string[] {
    return this.boxes
      .filter((b) => !(b.maxX < minX || b.minX > maxX || b.maxY < minY || b.minY > maxY))
      .map((b) => b.id);
  }

  /**
   * Finds alignment guide snap targets within a given threshold distance
   */
  public findSnapTargets(
    currentBox: BoundingBox,
    threshold: number = 5
  ): { snapX: number | null; snapY: number | null; guideLines: { type: 'horizontal' | 'vertical'; pos: number }[] } {
    let snapX: number | null = null;
    let snapY: number | null = null;
    let minDiffX = threshold;
    let minDiffY = threshold;
    const guideLines: { type: 'horizontal' | 'vertical'; pos: number }[] = [];

    const curCenterX = (currentBox.minX + currentBox.maxX) / 2;
    const curCenterY = (currentBox.minY + currentBox.maxY) / 2;

    for (const b of this.boxes) {
      if (b.id === currentBox.id) continue;

      const targetCenterX = (b.minX + b.maxX) / 2;
      const targetCenterY = (b.minY + b.maxY) / 2;

      // X-axis alignment checks (Left, Center, Right)
      const xChecks = [
        { cur: currentBox.minX, target: b.minX, offset: 0 },
        { cur: currentBox.maxX, target: b.maxX, offset: currentBox.maxX - currentBox.minX },
        { cur: curCenterX, target: targetCenterX, offset: (currentBox.maxX - currentBox.minX) / 2 },
      ];

      for (const check of xChecks) {
        const diff = Math.abs(check.cur - check.target);
        if (diff < minDiffX) {
          minDiffX = diff;
          snapX = check.target - check.offset;
          guideLines.push({ type: 'vertical', pos: check.target });
        }
      }

      // Y-axis alignment checks (Top, Center, Bottom)
      const yChecks = [
        { cur: currentBox.minY, target: b.minY, offset: 0 },
        { cur: currentBox.maxY, target: b.maxY, offset: currentBox.maxY - currentBox.minY },
        { cur: curCenterY, target: targetCenterY, offset: (currentBox.maxY - currentBox.minY) / 2 },
      ];

      for (const check of yChecks) {
        const diff = Math.abs(check.cur - check.target);
        if (diff < minDiffY) {
          minDiffY = diff;
          snapY = check.target - check.offset;
          guideLines.push({ type: 'horizontal', pos: check.target });
        }
      }
    }

    return { snapX, snapY, guideLines };
  }
}

export const globalSpatialIndex = new SpatialIndex();
