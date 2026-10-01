import React from 'react';

interface InlineTextEditorOverlayProps {
  editConfig: any;
  zoom: number;
  saveContent: (shouldClose?: boolean) => void;
  textInputRef: React.MutableRefObject<HTMLDivElement | null>;
  editConfigRef: React.MutableRefObject<any | null>;
  activeEditingTextRef: React.MutableRefObject<string | null>;
  textDebounceTimerRef: React.MutableRefObject<number | null>;
  setEditConfig: React.Dispatch<React.SetStateAction<any | null>>;
  catalog: any;
  currentPageIndex: number;
  updateHeaderElement: (id: string, updates: any) => void;
  updateFooterElement: (id: string, updates: any) => void;
  updateElement: (pageIndex: number, id: string, updates: any) => void;
}

export const InlineTextEditorOverlay: React.FC<InlineTextEditorOverlayProps> = ({
  editConfig,
  zoom,
  saveContent,
  textInputRef,
  editConfigRef,
  activeEditingTextRef,
  textDebounceTimerRef,
  setEditConfig,
  catalog,
  currentPageIndex,
  updateHeaderElement,
  updateFooterElement,
  updateElement,
}) => {
  if (!editConfig) return null;

  return (
    <div
      className="absolute z-[3000]"
      style={{
        left: editConfig.x * zoom,
        top: editConfig.y * zoom,
        width: editConfig.width * zoom,
        height: editConfig.height * zoom,
        transform: `rotate(${editConfig.rotation || 0}deg)`,
        transformOrigin: 'top left',
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        contentEditable
        suppressContentEditableWarning
        className="w-full h-full outline-none overflow-visible selection:bg-[#8B3DFF]/30 border border-[#8B3DFF] rounded-[2px]"
        style={{
          fontSize: editConfig.fontSize * zoom,
          fontFamily: editConfig.fontFamily || 'Inter',
          fontWeight: editConfig.fontWeight,
          fontStyle: editConfig.fontStyle,
          textAlign: editConfig.align,
          lineHeight: editConfig.lineHeight || 1.2,
          letterSpacing: (editConfig.letterSpacing || 0) * zoom,
          opacity: editConfig.opacity ?? 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent:
            editConfig.verticalAlign === 'middle'
              ? 'center'
              : editConfig.verticalAlign === 'bottom'
              ? 'flex-end'
              : 'flex-start',
          ...(editConfig.color?.includes('gradient')
            ? {
                background: editConfig.color,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }
            : {
                color: editConfig.color,
              }),
          ...(() => {
            if (!editConfig.effectStyle || editConfig.effectStyle === 'none') return {};
            const color = editConfig.effectColor || '#000000';
            const color2 = editConfig.effectColor2 || '#00fff9';
            const offX = (editConfig.shadowOffsetX || 0) * zoom;
            const offY = (editConfig.shadowOffsetY || 0) * zoom;
            const blur = (editConfig.shadowBlur || 0) * zoom;
            const opacity =
              editConfig.shadowOpacity !== undefined && editConfig.shadowOpacity !== null
                ? editConfig.shadowOpacity
                : 0.5;
            const thickness = (editConfig.textStrokeWidth || 1) * zoom;

            switch (editConfig.effectStyle) {
              case 'hollow':
                return {
                  WebkitTextStroke: `${thickness}px ${color}`,
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent',
                };
              case 'outline':
                return { WebkitTextStroke: `${thickness}px ${color}` };
              case 'shadow':
                return {
                  textShadow: `${offX}px ${offY}px ${blur}px ${color}${Math.round(
                    opacity * 255
                  )
                    .toString(16)
                    .padStart(2, '0')}`,
                };
              case 'lift':
                return { textShadow: `0px ${4 * zoom}px ${blur}px rgba(0,0,0,${opacity})` };
              case 'neon':
                return {
                  color: color,
                  textShadow:
                    opacity > 0
                      ? `0 0 ${5 * zoom * opacity}px ${color}, 0 0 ${
                          10 * zoom * opacity
                        }px ${color}, 0 0 ${20 * zoom * opacity}px ${color}`
                      : 'none',
                };
              case 'glitch':
                return {
                  textShadow: `${offX}px ${offY}px 0 ${color}, ${-offX}px ${-offY}px 0 ${color2}`,
                };
              case 'echo':
                return {
                  textShadow: `${offX}px ${offY}px 0px ${color}aa, ${offX * 2}px ${
                    offY * 2
                  }px 0px ${color}66, ${offX * 3}px ${offY * 3}px 0px ${color}33`,
                };
              case 'splice':
                return {
                  WebkitTextStroke: `${thickness}px ${color}`,
                  textShadow: `${offX}px ${offY}px 0px ${color}88`,
                };
              case 'background':
                return {
                  backgroundColor: `${color}${Math.round(opacity * 255)
                    .toString(16)
                    .padStart(2, '0')}`,
                  display: 'inline-block',
                };
              default:
                return {};
            }
          })(),
          caretColor: '#8b3dff',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          padding: '0px',
          minWidth: 20 * zoom,
          minHeight: 20 * zoom,
          boxSizing: 'border-box',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            saveContent(true);
          }
        }}
        onBlur={(e) => {
          const related = e.relatedTarget as HTMLElement | null;
          if (
            related &&
            (e.currentTarget.contains(related) ||
              related.closest('.text-toolbar') ||
              related.closest('[data-text-toolbar]'))
          ) {
            return;
          }
          saveContent(true);
        }}
        onInput={(e) => {
          const target = e.currentTarget as HTMLElement;
          let content = target.innerText || target.textContent || '';
          content = content.replace(/<[^>]*>/g, '');

          const cur = editConfigRef.current;
          if (cur?.id) {
            activeEditingTextRef.current = content;
            const isHeader = catalog.headerElements?.some((el: any) => el.id === cur.id);
            const isFooter = catalog.footerElements?.some((el: any) => el.id === cur.id);
            const updates: any = { text: content };

            if (!isHeader && !isFooter) {
              const newHeight = Math.max(20, target.scrollHeight / zoom);
              if (Math.abs(newHeight - cur.height) > 1) {
                updates.height = newHeight;
              }
            }

            editConfigRef.current = { ...cur, ...updates };
            setEditConfig((prev) => (prev ? { ...prev, ...updates } : null));

            if (textDebounceTimerRef.current) clearTimeout(textDebounceTimerRef.current);
            textDebounceTimerRef.current = window.setTimeout(() => {
              if (isHeader) {
                updateHeaderElement(cur.id, updates);
              } else if (isFooter) {
                updateFooterElement(cur.id, updates);
              } else {
                const targetPageIndex =
                  cur.pageIndex !== undefined ? cur.pageIndex : currentPageIndex;
                updateElement(targetPageIndex, cur.id, updates);
              }
            }, 300);
          }
        }}
        ref={(el) => {
          textInputRef.current = el;
          if (el && editConfig && (el as any)._initializedForId !== editConfig.id) {
            (el as any)._initializedForId = editConfig.id;
            el.innerText = (editConfig.text || '').replace(/<[^>]*>/g, '');
            el.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(el);
            range.collapse(false);
            if (sel) {
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
        }}
      />
    </div>
  );
};
