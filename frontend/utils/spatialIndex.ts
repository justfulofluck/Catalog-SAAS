export interface BoundingBox {
  id: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  zIndex: number;
}

export interface DistanceBadge {
  type: 'vertical' | 'horizontal';
  startPos: number;
  endPos: number;
  crossPos: number;
  distance: number;
  displayValue: string;
}

export interface SnapResult {
  snapX: number | null;
  snapY: number | null;
  guideLines: { type: 'horizontal' | 'vertical'; pos: number }[];
  distanceBadges: DistanceBadge[];
}

/**
 * 2D Spatial Index & Bounding Volume Hierarchy (BVH) for O(log N) hit testing,
 * viewport culling, and proximity detection for smart alignment guides and spacing calculation.
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
   * Finds alignment guide snap targets and dynamic spacing badges between neighbouring elements
   */
  public findSnapTargets(
    currentBox: BoundingBox,
    threshold: number = 6,
    margins?: { top?: number; bottom?: number; left?: number; right?: number }
  ): SnapResult {
    let snapX: number | null = null;
    let snapY: number | null = null;
    let minDiffX = threshold;
    let minDiffY = threshold;
    const guideLines: { type: 'horizontal' | 'vertical'; pos: number }[] = [];
    const distanceBadges: DistanceBadge[] = [];

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

      // Calculate vertical gap / padding (when vertically adjacent with overlap in X)
      const hasHorizontalOverlap = Math.max(currentBox.minX, b.minX) < Math.min(currentBox.maxX, b.maxX);
      if (hasHorizontalOverlap) {
        const crossX = (Math.max(currentBox.minX, b.minX) + Math.min(currentBox.maxX, b.maxX)) / 2;
        
        // Target is ABOVE current element
        if (b.maxY <= currentBox.minY && currentBox.minY - b.maxY < 120) {
          const gap = currentBox.minY - b.maxY;
          if (gap > 0) {
            distanceBadges.push({
              type: 'vertical',
              startPos: b.maxY,
              endPos: currentBox.minY,
              crossPos: crossX,
              distance: Math.round(gap),
              displayValue: (gap / 10).toFixed(1) // e.g. 0.6
            });
          }
        }
        // Target is BELOW current element
        else if (currentBox.maxY <= b.minY && b.minY - currentBox.maxY < 120) {
          const gap = b.minY - currentBox.maxY;
          if (gap > 0) {
            distanceBadges.push({
              type: 'vertical',
              startPos: currentBox.maxY,
              endPos: b.minY,
              crossPos: crossX,
              distance: Math.round(gap),
              displayValue: (gap / 10).toFixed(1)
            });
          }
        }
      }

      // Calculate horizontal gap / padding (when horizontally adjacent with overlap in Y)
      const hasVerticalOverlap = Math.max(currentBox.minY, b.minY) < Math.min(currentBox.maxY, b.maxY);
      if (hasVerticalOverlap) {
        const crossY = (Math.max(currentBox.minY, b.minY) + Math.min(currentBox.maxY, b.maxY)) / 2;

        // Target is to LEFT of current element
        if (b.maxX <= currentBox.minX && currentBox.minX - b.maxX < 120) {
          const gap = currentBox.minX - b.maxX;
          if (gap > 0) {
            distanceBadges.push({
              type: 'horizontal',
              startPos: b.maxX,
              endPos: currentBox.minX,
              crossPos: crossY,
              distance: Math.round(gap),
              displayValue: (gap / 10).toFixed(1)
            });
          }
        }
        // Target is to RIGHT of current element
        else if (currentBox.maxX <= b.minX && b.minX - currentBox.maxX < 120) {
          const gap = b.minX - currentBox.maxX;
          if (gap > 0) {
            distanceBadges.push({
              type: 'horizontal',
              startPos: currentBox.maxX,
              endPos: b.minX,
              crossPos: crossY,
              distance: Math.round(gap),
              displayValue: (gap / 10).toFixed(1)
            });
          }
        }
      }
    }

    // Canva-style Margin line alignment checks (Left, Right, Top, Bottom)
    if (margins) {
      // Left Margin snap
      if (typeof margins.left === 'number' && margins.left > 0) {
        const diffLeft = Math.abs(currentBox.minX - margins.left);
        if (diffLeft < minDiffX) {
          minDiffX = diffLeft;
          snapX = margins.left;
          guideLines.push({ type: 'vertical', pos: margins.left });
        }
      }
      // Right Margin snap
      if (typeof margins.right === 'number' && margins.right > 0) {
        const diffRight = Math.abs(currentBox.maxX - margins.right);
        if (diffRight < minDiffX) {
          minDiffX = diffRight;
          snapX = margins.right - (currentBox.maxX - currentBox.minX);
          guideLines.push({ type: 'vertical', pos: margins.right });
        }
      }
      // Top Margin snap
      if (typeof margins.top === 'number' && margins.top > 0) {
        const diffTop = Math.abs(currentBox.minY - margins.top);
        if (diffTop < minDiffY) {
          minDiffY = diffTop;
          snapY = margins.top;
          guideLines.push({ type: 'horizontal', pos: margins.top });
        }
      }
      // Bottom Margin snap
      if (typeof margins.bottom === 'number' && margins.bottom > 0) {
        const diffBottom = Math.abs(currentBox.maxY - margins.bottom);
        if (diffBottom < minDiffY) {
          minDiffY = diffBottom;
          snapY = margins.bottom - (currentBox.maxY - currentBox.minY);
          guideLines.push({ type: 'horizontal', pos: margins.bottom });
        }
      }
    }

    return { snapX, snapY, guideLines, distanceBadges };
  }
}

export const globalSpatialIndex = new SpatialIndex();
