import View from "core/program/View";

/**
 * A View which handles scrolling.
 */
export interface ScrollableView extends View {
    onScroll (): void;
}

/**
 * A View which handles resizing.
 */
export interface ResizableView extends View {
    onResize (): void;
}