import Time from "core/system/Time";
import Tween from "core/tween/Tween";

import { normalizeWheel } from "external/normalizeWheel";
import { clamp, hasSameSign } from "core/system/Math";
import { Query } from "core/dom/Query";
import { Ease } from "core/tween/Ease";

/**
 * @ private interface WheelDelta
 * 
 * An object containing normalized delta x/y values from a WheelEvent.
 */
interface WheelDelta {
    /* @ The normalized delta x. */
    x: number;
    /* @ The normalized delta y. */
    y: number;
}

/**
 * @ public class ScrollArea
 * 
 * Creates a virtual "scrollable" area on an element, overriding its DOM wheel
 * event and using a CSS translation transform to represent scroll behavior.
 */
export default class ScrollArea {
    /* @ The current scroll top value. */
    public scrollTop: number = 0;
    /* @ The current scroll left value. */
    public scrollLeft: number = 0;
    /* @ A Query reference to the Element(s) to scroll. */
    private $scrollable: Query;
    /* @ The width of the ScrollArea container. */
    private containerWidth: number;
    /* @ The height of the ScrollArea container. */
    private containerHeight: number;
    /* @ The total scrollable width of the ScrollArea region. */
    private scrollWidth: number;
    /* @ The total scrollable height of the ScrollArea region. */
    private scrollHeight: number;
    /* @ The current maximum acceptable scrollTop value. */
    private maxScrollTop: number = 0;
    /* @ The current maximum acceptable scrollLeft value. */
    private maxScrollLeft: number = 0;
    /* @ The current x momentum value. */
    private momentumX: number = 0;
    /* @ The current y momentum value. */
    private momentumY: number = 0;
    /* @ Determines whether the onScrollUpdate cycle is active. */
    private isScrolling: boolean = false;

    constructor ($listener: Query, $scrollable: Query, width: number, height: number) {
        var scrollBounds: any = $listener.bounds();
        this.$scrollable = $scrollable;
        this.containerWidth = scrollBounds.width;
        this.containerHeight = scrollBounds.height;

        this.setScrollArea(width, height);
        this.saveMaximumScrollOffsets();

        // Prevent context loss for onScrollUpdate when
        // it gets passed into requestAnimationFrame
        this.onScrollUpdate = this.onScrollUpdate.bind(this);

        $listener.on('wheel', (e: WheelEvent) => {
            this.captureScrollEvent(e);
            e.stopPropagation();
        });
    }

    /**
     * Configure the ScrollArea width/height boundary.
     */
    public setScrollArea (width: number, height: number): void {
        this.scrollWidth = width;
        this.scrollHeight = height;
    }

    /**
     * Sets the top/left scroll position.
     */
    public scrollTo (top: number, left: number): void {
        var translation: string = 'translate(' + -left + 'px, ' + -top + 'px)';

        this.$scrollable.transform(translation);
    }

    /**
     * Determines whether the scroll momentum has been lost.
     */
    private isStopped (): boolean {
        return (this.momentumX === 0 && this.momentumY === 0);
    }

    /**
     * Caches the maximum scroll top/left values for boundary checks.
     */
    private saveMaximumScrollOffsets (): void {
        this.maxScrollTop = this.scrollHeight - this.containerHeight;
        this.maxScrollLeft = this.scrollWidth - this.containerWidth;
    }

    /**
     * Captures a new WheelEvent to control scroll behavior.
     */
    private captureScrollEvent (e: WheelEvent): void {
        var delta: WheelDelta = this.normalizeWheelEvent(e);

        this.stopIfScrollDirectionChanged(delta);
        this.updateMomentumFromDelta(delta);

        if (!this.isScrolling) {
            this.onScrollUpdate();
        }
    }

    /**
     * Resets momentum if the scroll delta changes direction.
     */
    private stopIfScrollDirectionChanged(delta: WheelDelta): void {
        if (!hasSameSign(delta.x, this.momentumX)) {
            this.momentumX = 0;
        }

        if (!hasSameSign(delta.y, this.momentumY)) {
            this.momentumY = 0;
        }
    }

    /**
     * Updates the scroll momentum from a WheelDelta.
     */
    private updateMomentumFromDelta (delta: WheelDelta): void {
        this.momentumX += delta.x;
        this.momentumY += delta.y;
    }

    /**
     * The scroll update handler.
     */
    private onScrollUpdate (): void {
        if (this.isStopped()) {
            this.isScrolling = false;

            return;
        }

        this.isScrolling = true;

        this.updateScrollOffsetsFromMomentum();
        this.boundScrollOffsets();
        this.scrollTo(this.scrollTop, this.scrollLeft);
        this.loseMomentum();

        requestAnimationFrame(this.onScrollUpdate);
    }

    /**
     * Updates the scrollTop/scrollLeft values based on the current momentum.
     */
    private updateScrollOffsetsFromMomentum (): void {
        this.scrollTop += this.momentumY;
        this.scrollLeft += this.momentumX;
    }

    /**
     * Bounds the current scroll top/left values to within the maximum ranges.
     */
    private boundScrollOffsets (): void {
        this.scrollTop = clamp(this.scrollTop, 0, this.maxScrollTop);
        this.scrollLeft = clamp(this.scrollLeft, 0, this.maxScrollLeft);
    }

    /**
     * Gradually decreases the scroll momentum for either the x or y momentum
     * component; if the component is omitted, both are decreased.
     */
    private loseMomentum (momentum: string = null): void {
        if (!momentum) {
            this.loseMomentum('momentumX');
            this.loseMomentum('momentumY');

            return;
        }

        if (this[momentum] === 0) {
            return;
        }

        var oldMomentum: number = this[momentum];
        this[momentum] += (oldMomentum < 0 ? 1 : -1);

        if (!hasSameSign(this[momentum], oldMomentum)) {
            this[momentum] = 0;
        }
    }

    /**
     * Returns a normalized WheelDelta from a WheelEvent instance.
     */
    private normalizeWheelEvent (e: WheelEvent): WheelDelta {
        var normalized: any = normalizeWheel(e);

        return {
            x: normalized.pixelX / 50,
            y: normalized.pixelY / 50
        };
    }
}