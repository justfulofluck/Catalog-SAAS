
/**
 * Applies CSS styles to the currently active text selection using document.execCommand('insertHTML').
 * This allows for partial text styling (color, gradient, effects) within a contentEditable element.
 * 
 * @param styleString - The CSS style string to apply (e.g., "color: red; font-weight: bold;")
 * @param attributes - Optional HTML attributes to add to the span (e.g., 'id="my-id" class="bold"')
 * @returns boolean - True if the style was applied to a selection, False otherwise.
 */
export const applyStyleToSelection = (styleString: string, attributes: string = ''): boolean => {
    const selection = window.getSelection();

    // Basic validation: Must have a selection and it must not be collapsed (cursor only)
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return false;
    }

    // Ensure the selection is actually within a contentEditable element
    const anchorNode = selection.anchorNode;
    const focusNode = selection.focusNode;

    if (!anchorNode || !focusNode) return false;

    const parentEditable = (
        anchorNode.nodeType === Node.ELEMENT_NODE
            ? (anchorNode as Element).closest('[contenteditable="true"]')
            : anchorNode.parentElement?.closest('[contenteditable="true"]')
    );

    if (!parentEditable) return false;

    // Create standard span with styling
    // We use a span with the style attribute.
    const spanHtml = `<span style="${styleString}" ${attributes}>${selection.toString()}</span>`;

    try {
        // execCommand 'insertHTML' is widely supported for contentEditable
        // and handles splitting existing nodes and maintaining the undo stack better than manual DOM manipulation.
        return document.execCommand('insertHTML', false, spanHtml);
    } catch (e) {
        console.error('Failed to apply style to selection:', e);
        return false;
    }
};
