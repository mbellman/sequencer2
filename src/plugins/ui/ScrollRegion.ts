import { normalizeWheel, NormalizedWheel } from "plugins/external/NormalizeWheel";
import { EventManager, EventsContainer } from "core/system/Event";
import { bindAll, defaultTo } from "core/system/Utilities";
import { clamp, hasSameSign } from "core/system/math/Utilities";
import { Point, Area, Offset } from "core/system/math/Geometry";
import { Momentum2 } from "core/system/math/Physics";
import { Query } from "core/dom/DOM";

/**
 * Settings for a ScrollRegion instance.
 */
interface ScrollRegionSettings {
    /* The scroll speed from [0 - 1], handled as the scroll momentum decay factor. */
    speed?: number;
}

/**
 * A Point alias for use in relation to mouse wheel deltas.
 */
type WheelDelta = Point;

/**
 * Creates a virtual scroll region inside an element, overriding its DOM wheel
 * event and using a CSS translation transform to represent scroll behavior.
 */
export default class ScrollRegion extends EventsContainer {
    /* The instance settings, configurable via configure(). */
    private settings: ScrollRegionSettings = {
        speed: 0.9
    };

    /* The outer scroll container $(element). */
    private $container: Query;

    /* The inner content $(element). */
    private $content: Query;

    /* The current scroll top/left. */
    private scrollOffset: Offset = {};

    /* The current maximum permitted scroll top/left; calculated automatically in updateMaximumScrollOffset(). */
    private maximumScrollOffset: Offset = {};

    /* The full size of the inner scroll region. */
    private scrollArea: Area = {
        width: 0,
        height: 0
    };

    /* The current scroll x/y momentum. */
    private scrollMomentum: Momentum2 = new Momentum2(0, 0);

    /**
     * Determines whether the onScrollUpdate cycle is active. Set to true on the first captureScrollEvent(), and
     * remains true until the scroll momentum decreases to zero. This ensures that only one requestAnimationFrame
     * cycle is created for onScrollUpdate().
     */
    private isScrolling: boolean = false;

    /**
     * @constructor
     */
    constructor ($container: Query, $content: Query, width?: number, height?: number) {
        super();

        bindAll(this, 'onScrollUpdate');

        this.$container = $container;
        this.$content = $content;

        this.setScrollArea(width, height);
        this.scrollTo(0, 0);

        this.$container.on('wheel', (e: WheelEvent) => {
            this.captureScrollEvent(e);
            e.stopPropagation();
        });
    }

    /**
     * @getter {scrollTop}
     */
    public get scrollTop (): number {
        return this.scrollOffset.top;
    }

    /**
     * @setter {scrollTop}
     */
    public set scrollTop (top: number) {
        this.scrollOffset.top = top;

        this.scrollTo(top, this.scrollLeft);
    }

    /**
     * @getter {scrollLeft}
     */
    public get scrollLeft (): number {
        return this.scrollOffset.left;
    }

    /**
     * @setter {scrollLeft}
     */
    public set scrollLeft (left: number) {
        this.scrollOffset.left = left;

        this.scrollTo(this.scrollTop, left);
    }

    /**
     * @getter {scrollWidth}
     */
    public get scrollWidth (): number {
        return this.scrollArea.width;
    }

    /**
     * @getter {scrollHeight}
     */
    public get scrollHeight (): number {
        return this.scrollArea.height;
    }

    /**
     * @getter {maximumScrollTop}
     */
    public get maximumScrollTop (): number {
        return this.maximumScrollOffset.top;
    }

    /**
     * @getter {maximumScrollLeft}
     */
    public get maximumScrollLeft (): number {
        return this.maximumScrollOffset.left;
    }

    /**
     * Sets the ScrollRegion area width/height.
     */
    public setScrollArea (width?: number, height?: number): void {
        this.scrollArea.width = Math.max(defaultTo(width, this.scrollArea.width), 0);
        this.scrollArea.height = Math.max(defaultTo(height, this.scrollArea.height), 0);

        this.updateMaximumScrollOffset();
    }

    /**
     * Changes the ScrollRegion behavior settings.
     */
    public configure (settings: ScrollRegionSettings): void {
        this.settings.speed = defaultTo(settings.speed, this.settings.speed);
    }

    /**
     * Sets the top/left scroll position.
     */
    public scrollTo (top: number, left: number): void {
        this.scrollOffset.top = clamp(top, 0, this.maximumScrollOffset.top);
        this.scrollOffset.left = clamp(left, 0, this.maximumScrollOffset.left);

        var translation: string = 'translate(' + -this.scrollLeft + 'px, ' + -this.scrollTop + 'px)';

        this.$content.transform(translation);
        this.events.trigger('scroll');
    }

    /**
     * Captures a new WheelEvent to control scroll behavior.
     */
    private captureScrollEvent (e: WheelEvent): void {
        var delta: WheelDelta = this.getNormalizedWheelDelta(e);

        this.stopIfScrollDirectionChanged(delta);
        this.scrollMomentum.add(delta.x, delta.y);

        if (!this.isScrolling) {
            this.onScrollUpdate();
        }
    }

    /**
     * The scroll update handler.
     */
    private onScrollUpdate (): void {
        if (this.scrollMomentum.isNull()) {
            this.isScrolling = false;

            return;
        }

        this.isScrolling = true;

        this.updateScrollOffsetsFromMomentum();
        this.decayMomentum();
        this.scrollTo(this.scrollTop, this.scrollLeft);

        requestAnimationFrame(this.onScrollUpdate);
    }

    /**
     * Gradually reduces the scroll momentum.
     */
    private decayMomentum (): void {
        if (this.scrollMomentum.isNull()) {
            return;
        }

        this.scrollMomentum.decay(this.settings.speed);
    }

    /**
     * Resets momentum if the mouse wheel delta suddenly changes direction.
     */
    private stopIfScrollDirectionChanged(delta: WheelDelta): void {
        if (!hasSameSign(delta.x, this.scrollMomentum.x)) {
            this.scrollMomentum.x = 0;
        }

        if (!hasSameSign(delta.y, this.scrollMomentum.y)) {
            this.scrollMomentum.y = 0;
        }
    }

    /**
     * Updates the scrollTop/scrollLeft values based on the current momentum.
     */
    private updateScrollOffsetsFromMomentum (): void {
        this.scrollOffset.top += this.scrollMomentum.y;
        this.scrollOffset.left += this.scrollMomentum.x;
    }

    /**
     * Caches the maximum scroll top/left values for boundary checks;
     * called only by setScrollArea().
     */
    private updateMaximumScrollOffset (): void {
        this.maximumScrollOffset.top = Math.max(0, this.scrollArea.height - this.$container.height());
        this.maximumScrollOffset.left = Math.max(0, this.scrollArea.width - this.$container.width());
    }

    /**
     * Returns a normalized delta x/y from a mouse WheelEvent instance.
     */
    private getNormalizedWheelDelta (e: WheelEvent): WheelDelta {
        var normalized: NormalizedWheel = normalizeWheel(e);

        return {
            x: normalized.pixelX / 50,
            y: normalized.pixelY / 50
        };
    }
}