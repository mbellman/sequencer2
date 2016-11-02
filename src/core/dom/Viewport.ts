import { each } from "core/system/Utilities";
import { Area } from "core/system/math/Geometry";
import { EventManager, EventContainer } from "core/system/Event";

/**
 * An API which provides information about the browser page viewport. Since this module
 * exports a Viewport singleton as its default, methods and properties can be referenced
 * as if static.
 */
class Viewport extends EventContainer {
    /**
     * An EventManager instance to manage viewport resize event handlers.
     * @implementation (EventContainer)
     */
    protected events: EventManager = new EventManager();

    /* The current viewport width/height. */
    private area: Area = {
        width: 0,
        height: 0
    };

    /* A static Viewport singleton. */
    private static viewport: Viewport;

    /**
     * @constructor
     */
    constructor () {
        super();

        this.readWindowSize();

        window.addEventListener('resize', () => {
            this.readWindowSize();
            this.events.trigger('resize');
        });
    }

    /**
     * Retrieves the internal Viewport singleton.
     */
    public static getInstance (): Viewport {
        if (!this.viewport) {
            this.viewport = new Viewport();
        }

        return this.viewport;
    }

    /**
     * @getter {width}
     */
    public get width (): number {
        return this.area.width;
    }

    /**
     * @getter {height}
     */
    public get height (): number {
        return this.area.height;
    }

    /**
     * Saves viewport resize event handlers to the internal {events} EventManager.
     * @implementation (EventContainer)
     */
    public on (event: 'resize', handler: Function): void {
        this.events.on(event, handler);
    }

    /**
     * Checks and saves the current window width/height.
     */
    private readWindowSize (): void {
        this.area.width = window.innerWidth;
        this.area.height = window.innerHeight;
    }
}

/**
 * The module's default export, a singleton of Viewport.
 */
export default Viewport.getInstance();