import { each } from "core/system/Utilities";
import { Area } from "core/system/math/Geometry";
import { EventManager } from "core/system/Event";

/**
 * A static singleton providing information about the browser page viewport.
 */
export default class Viewport {
    private static size: Area = { width: 0, height: 0 };
    private static isInitialized: boolean = false;

    /* An EventManager instance to manage viewport resize event handlers. */
    private static events: EventManager = new EventManager();

    public static initialize (): void {
        if (!this.isInitialized) {
            this.readWindowSize();

            window.addEventListener('resize', () => {
                this.readWindowSize();
                this.events.trigger('resize');
            });

            this.isInitialized = true;
        }
    }

    public static get width (): number {
        return this.size.width;
    }

    public static get height (): number {
        return this.size.height;
    }

    /**
     * Saves viewport resize event handlers to the internal {events} EventManager.
     * The on() syntax is for pattern consistency, but only 'resize' is allowed
     * as the event argument.
     */
    public static on (event: 'resize', handler: Function): void {
        this.events.on(event, handler);
    }

    /**
     * Checks and saves the current viewport dimensions.
     */
    private static readWindowSize (): void {
        this.size.width = window.innerWidth;
        this.size.height = window.innerHeight;
    }
}