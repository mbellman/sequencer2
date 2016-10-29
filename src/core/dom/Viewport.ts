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

    /**
     * Adds the necessary event listeners to keep the Viewport information up-to-date.
     */
    public static initialize (): void {
        this.updateDimensions();

        window.addEventListener('resize', (e: Event) => {
            this.updateDimensions();
        });
    }

    /**
     * Updates the saved viewport dimensions.
     */
    private static updateDimensions (): void {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }
}