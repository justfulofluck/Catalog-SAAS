/**
 * Applies CSS styles to the currently active text selection.
 * Handles both native formatting (B/I/U/Color) and advanced span-based effects.
 */

export interface SelectionState {
    start: number;
    end: number;
}

/**
 * Saves the current selection as character offsets relative to a container.
 */
export const saveSelection = (container: HTMLElement): SelectionState | null => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;

    try {
        const range = sel.getRangeAt(0);
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(container);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;

        return {
            start: start,
            end: start + range.toString().length
        };
    } catch (e) {
        return null;
    }
};

/**
 * Restores the selection based on saved character offsets within a container.
 */
export const restoreSelection = (container: HTMLElement, state: SelectionState | null) => {
    if (!state) return;

    const sel = window.getSelection();
    if (!sel) return;

    let charIndex = 0;
    const range = document.createRange();
    range.setStart(container, 0);
    range.collapse(true);

    const nodeStack: Node[] = [container];
    let node: Node | undefined;
    let foundStart = false;
    let stop = false;

    while (!stop && (node = nodeStack.pop())) {
        if (node.nodeType === 3) { // Text node
            const nextCharIndex = charIndex + (node.textContent?.length || 0);
            if (!foundStart && state.start >= charIndex && state.start <= nextCharIndex) {
                range.setStart(node, state.start - charIndex);
                foundStart = true;
            }
            if (foundStart && state.end >= charIndex && state.end <= nextCharIndex) {
                range.setEnd(node, state.end - charIndex);
                stop = true;
            }
            charIndex = nextCharIndex;
        } else {
            let i = node.childNodes.length;
            while (i--) {
                nodeStack.push(node.childNodes[i]);
            }
        }
    }

    sel.removeAllRanges();
    sel.addRange(range);
};

/**
 * Uses native document.execCommand for robust toggling and merging of basic styles.
 */
export const toggleStyle = (command: 'bold' | 'italic' | 'underline' | 'foreColor', value?: string): boolean => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;

    const range = sel.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const parentEditable = container.nodeType === Node.ELEMENT_NODE
        ? (container as Element).closest('[contenteditable="true"]')
        : container.parentElement?.closest('[contenteditable="true"]');

    if (!parentEditable) return false;

    // Save offsets to restore focus/selection after command
    const offsets = saveSelection(parentEditable as HTMLElement);

    try {
        const success = document.execCommand(command, false, value);
        if (success && offsets) {
            restoreSelection(parentEditable as HTMLElement, offsets);
            // Trigger input for store sync
            parentEditable.dispatchEvent(new Event('input', { bubbles: true }));
        }
        return success;
    } catch (e) {
        console.error(`Failed to apply ${command}:`, e);
        return false;
    }
};

/**
 * For complex effects that aren't supported by execCommand.
 */
export const applyEffectToSelection = (styleString: string, attributes: string = ''): boolean => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const parentEditable = container.nodeType === Node.ELEMENT_NODE
        ? (container as Element).closest('[contenteditable="true"]')
        : container.parentElement?.closest('[contenteditable="true"]');

    if (!parentEditable) return false;

    const offsets = saveSelection(parentEditable as HTMLElement);
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(range.cloneContents());
    const innerHtml = tempDiv.innerHTML || selection.toString();

    // Use inherit to allow the container's font settings to flow through
    const spanHtml = `<span style="font-family: inherit; font-size: inherit; ${styleString}" ${attributes}>${innerHtml}</span>`;

    try {
        const success = document.execCommand('insertHTML', false, spanHtml);
        if (success && offsets) {
            restoreSelection(parentEditable as HTMLElement, offsets);
            parentEditable.dispatchEvent(new Event('input', { bubbles: true }));
        }
        return success;
    } catch (e) {
        console.error('Failed to apply effect to selection:', e);
        return false;
    }
};
