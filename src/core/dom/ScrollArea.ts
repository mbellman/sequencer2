import Time from "core/system/Time";
import Tween from "core/tween/Tween";

import { normalizeWheel, NormalizedWheelDelta } from "external/normalizeWheel";
import { clamp, hasSameSign } from "core/system/Math";
import { bindAll } from "core/system/Utilities";
import { Query } from "core/dom/Query";
import { Ease } from "core/tween/Ease";

/**
 * @ private type MomentumComponent
 * 
 * A property string representing one of two momentum component
 * properties on a ScrollArea instance.
 */
type MomentumComponent = 'momentumX' | 'momentumY';

/**
 * @ private type ScrollHandler
 * 
 * A ScrollArea scroll event handler.
 */
type ScrollHandler = (scrollTop: number, scrollLeft: number) => any;

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
 * @ private function getNormalizedWheelDelta
 * 
 * Returns a normalized WheelDelta from a mouse WheelEvent instance.
 */
function getNormalizedWheelDelta (e: WheelEvent): WheelDelta {
    var normalized: NormalizedWheelDelta = normalizeWheel(e);

    return {
        x: normalized.pixelX / 50,
        y: normalized.pixelY / 50
    };
}

/**
 * @ public class ScrollArea
 * 
 * Creates a virtual "scrollable" area on an element, overriding its DOM wheel
 * event and using a CSS translation transform to represent scroll behavior.
 */
export default class ScrollArea {
    /* @ The current scroll top value. */
    private _scrollTop: number = 0;
    /* @ The current scroll left value. */
    private _scrollLeft: number = 0;
    /* @ A Query reference to the Element(s) to bind the wheel event on. */
    private $listenerTarget: Query;
    /* @ A Query reference to the Element(s) to scroll. */
    private $scrollTarget: Query;
    /* @ The width of the ScrollArea container. */
    private containerWidth: number;
    /* @ The height of the ScrollArea container. */
    private containerHeight: number;
    /* @ The total scrollable width of the ScrollArea region. */
    private _scrollWidth: number;
    /* @ The total scrollable height of the ScrollArea region. */
    private _scrollHeight: number;
    /* @ The current maximum acceptable scrollTop value. */
    private _maxScrollTop: number = 0;
    /* @ The current maximum acceptable scrollLeft value. */
    private _maxScrollLeft: number = 0;
    /* @ The current x momentum value. */
    private momentumX: number = 0;
    /* @ The current y momentum value. */
    private momentumY: number = 0;
    /* @ Determines whether the onScrollUpdate cycle is active. */
    private isScrolling: boolean = false;
    /* @ A single scroll handler to run when during the onScrollUpdate cycle. */
    private scrollHandler: ScrollHandler;

    /**
     * @constructor
     */
    constructor ($listenerTarget: Query, $scrollTarget: Query, width?: number, height?: number) {
        bindAll(this, 'onScrollUpdate');

        this.$listenerTarget = $listenerTarget;
        this.$scrollTarget = $scrollTarget;
        this.containerWidth = $listenerTarget.width();
        this.containerHeight = $listenerTarget.height();

        this.setScrollRange(width || this.containerWidth, height || this.containerHeight);

        this.$listenerTarget.on('wheel', (e: WheelEvent) => {
            this.captureScrollEvent(e);
            e.stopPropagation();
        });
    }

    /**
     * @getter
     */
    get scrollTop (): number {
        return this._scrollTop;
    }

    /**
     * @getter
     */
    get scrollLeft (): number {
        return this._scrollLeft;
    }

    /**
     * @getter
     */
    get scrollWidth (): number {
        return this._scrollWidth;
    }

    /**
     * @getter
     */
    get scrollHeight (): number {
        return this._scrollHeight;
    }

    /**
     * @setter
     */
    set scrollTop (top: number) {
        this._scrollTop = top;

        this.scrollTo(top);
    }

    /**
     * @setter
     */
    set scrollLeft (left: number) {
        this._scrollLeft = left;

        this.scrollTo(null, left);
    }

    /**
     * Configure the ScrollArea width/height ranges.
     */
    public setScrollRange (width?: number, height?: number): void {
        this._scrollWidth = clamp(width || this._scrollWidth, 0, Number.POSITIVE_INFINITY);
        this._scrollHeight = clamp(height || this._scrollHeight, 0, Number.POSITIVE_INFINITY);

        this.updateMaximumScrollOffsets();
    }

    /**
     * Sets the top/left scroll position.
     */
    public scrollTo (top?: number, left?: number): void {
        var translation: string = 'translate(' + -left + 'px, ' + -top + 'px)';
        this._scrollTop = top || this._scrollTop;
        this._scrollLeft = left || this._scrollLeft;

        this.$scrollTarget.transform(translation);
    }

    /**
     * Sets the ScrollArea scroll event handler.
     */
    public onScroll (handler: ScrollHandler): void {
        this.scrollHandler = handler;
    }

    /**
     * Determines whether the scroll momentum has been lost.
     */
    private isStopped (): boolean {
        return (this.momentumX === 0 && this.momentumY === 0);
    }

    /**
     * Captures a new WheelEvent to control scroll behavior.
     */
    private captureScrollEvent (e: WheelEvent): void {
        var delta: WheelDelta = getNormalizedWheelDelta(e);

        this.stopIfScrollDirectionChanged(delta);
        this.updateMomentumFromDelta(delta);

        if (!this.isScrolling) {
            this.onScrollUpdate();
        }
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
        this.clampScrollOffsets();
        this.scrollTo(this.scrollTop, this.scrollLeft);
        this.decelerate();

        if (this.scrollHandler) {
            this.scrollHandler(this.scrollTop, this.scrollLeft);
        }

        requestAnimationFrame(this.onScrollUpdate);
    }

    /**
     * Gradually decreases the scroll momentum for either the x or y momentum
     * component; if the component is omitted, both are decreased.
     */
    private decelerate (momentum: MomentumComponent = null): void {
        if (!momentum) {
            this.decelerate('momentumX');
            this.decelerate('momentumY');

            return;
        }

        if (this[momentum] === 0) {
            return;
        }

        var oldMomentum: number = this[momentum];
        var momentumLoss: number = clamp(Math.round(oldMomentum / 10), 1, 5);
        this[momentum] += (oldMomentum < 0 ? momentumLoss : -momentumLoss);

        if (!hasSameSign(this[momentum], oldMomentum)) {
            this[momentum] = 0;
        }
    }

    /**
     * Resets momentum if the mouse wheel delta changes direction.
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
     * Updates the scrollTop/scrollLeft values based on the current momentum.
     */
    private updateScrollOffsetsFromMomentum (): void {
        this._scrollTop += this.momentumY;
        this._scrollLeft += this.momentumX;
    }

    /**
     * Clamps the current scroll top/left values to within the maximum ranges.
     */
    private clampScrollOffsets (): void {
        this._scrollTop = clamp(this.scrollTop, 0, this._maxScrollTop);
        this._scrollLeft = clamp(this.scrollLeft, 0, this._maxScrollLeft);
    }

    /**
     * Caches the maximum scroll top/left values for boundary checks.
     */
    private updateMaximumScrollOffsets (): void {
        this._maxScrollTop = Math.max(0, this._scrollHeight - this.containerHeight);
        this._maxScrollLeft = Math.max(0, this._scrollWidth - this.containerWidth);
    }
}