import { each } from "core/system/Utilities";

/**
 * @ public class Viewport
 * 
 * Provides information about the browser viewport.
 */
export default class Viewport {
    /* @ The current viewport width. */
    public static width: number;
    /* @ The current viewport height. */
    public static height: number;
    /* @ An internal list of page resize handlers. */
    private static resizeHandlers: Array<Function> = [];

    /**
     * Adds the necessary event listeners to keep the Viewport information up-to-date.
     */
    public static initialize (): void {
        this.updateDimensions();

        window.addEventListener('resize', (e: Event) => {
            this.updateDimensions();

            each(this.resizeHandlers, (handler: Function) => {
                handler();
            });
        });
    }

    /**
     * Adds a new page resize handler to the internal list.
     */
    public static onResize (handler: Function): void {
        this.resizeHandlers.push(handler);
    }

    /**
     * Updates the saved viewport dimensions.
     */
    private static updateDimensions (): void {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }
}