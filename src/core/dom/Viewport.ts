import { each } from "core/system/Utilities";
import { Area } from "core/system/math/Geometry";
import { EventManager, EventsContainer } from "core/system/Event";

/**
 * An API which provides information about the browser page viewport. Since this module
 * exports a Viewport singleton as its default, methods and properties can be referenced
 * as if static.
 */
class Viewport extends EventsContainer {
    /* A static Viewport singleton. */
    private static viewport: Viewport;

    /* The current viewport width/height. */
    private area: Area = {
        width: 0,
        height: 0
    };

    /**
     * @constructor
     */
    private constructor () {
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