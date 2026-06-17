# Canvas Performance Optimization

## Issue: Drag Lag on Interactive Elements

When selecting and dragging interactive components on the canvas, users experience significant lag or "jank".

## Root Causes

1. **No throttling on drag events** - Mouse move events fire 60-120+ times per second
2. **Excessive store subscriptions** - Components subscribe to entire store objects, causing full re-renders
3. **No memoization** - Objects recreated on every render
4. **Guide updates on every frame** - Triggers unnecessary re-renders

## Solutions

### 1. Throttle Drag Events (Highest Impact)

Add throttling to `handleDragMove` in `CanvasElement.tsx`:

```typescript
function useThrottle<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const lastRun = useRef(Date.now());
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    }
  }, [callback, delay]) as T;
}
```

### 2. Debounce Guide Updates

```typescript
const guideUpdateRef = useRef<NodeJS.Timeout | null>(null);

// In handleDragMove:
if (isDifferent) {
  if (guideUpdateRef.current) clearTimeout(guideUpdateRef.current);
  guideUpdateRef.current = setTimeout(() => {
    setGuides(guides);
  }, 16);
}
```

### 3. Memoize commonProps

Wrap `commonProps` object in `useMemo` to prevent recreation on every render.

### 4. Use Shallow Compare

```typescript
import { shallow } from 'zustand/shallow';

const selectedElementIds = useStore(state => state.selectedElementIds, shallow);
```

## Priority Order

| Step | Change | Risk | Impact |
|------|--------|------|--------|
| 1 | Throttle drag events | LOW | HIGH |
| 2 | Debounce guide updates | LOW | HIGH |
| 3 | Memoize commonProps | LOW | MEDIUM |
| 4 | Add shallow compare | LOW | MEDIUM |

## Files to Modify

- `frontend/components/Editor/CanvasElement.tsx`
