import Time from "core/system/Time";
import Tween from "core/system/tween/Tween";

import { normalizeWheel, NormalizedWheelDelta } from "ext/NormalizeWheel";
import { clamp, hasSameSign } from "core/system/math/Math";
import { Point, Area } from "core/system/math/Geometry";
import { bindAll } from "core/system/Utilities";
import { Query } from "core/dom/query/Query";
import { Ease } from "core/system/tween/Ease";

/**
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
 * Functionally equivalent to a Point; renamed for context.
 */
interface WheelDelta extends Point {}

/**
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
 * Creates a virtual "scrollable" area on an element, overriding its DOM wheel
 * event and using a CSS translation transform to represent scroll behavior.
 */
export default class ScrollArea {
    /* The current scroll offsets. */
    private _scrollTop: number = 0;
    private _scrollLeft: number = 0;

    /* A Query reference to the Element(s) to scroll. */
    private $container: Query;
    private $content: Query;

    private visibleArea: Area;
    private scrollArea: Area;

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

    constructor ($container: Query, $content: Query, width?: number, height?: number) {
        bindAll(this, 'onScrollUpdate');

        this.$container = $container;
        this.$content = $content;

        this.visibleArea = {
            width: $container.width(),
            height: $container.height()
        };

        this.scrollArea = {
            width: 0,
            height: 0
        };

        this.setScrollRange(width || this.visibleArea.width, height || this.visibleArea.height);

        this.$container.on('wheel', (e: WheelEvent) => {
            this.captureScrollEvent(e);
            e.stopPropagation();
        });
    }

    /**
     * {scrollTop}
     */
    public get scrollTop (): number {
        return this._scrollTop;
    }

    public set scrollTop (top: number) {
        this._scrollTop = top;

        this.scrollTo(top);
    }

    /**
     * {scrollLeft}
     */
    public get scrollLeft (): number {
        return this._scrollLeft;
    }

    public set scrollLeft (left: number) {
        this._scrollLeft = left;

        this.scrollTo(null, left);
    }

    /**
     * {scrollWidth}
     */
    public get scrollWidth (): number {
        return this.scrollArea.width;
    }

    /**
     * {scrollHeight}
     */
    public get scrollHeight (): number {
        return this.scrollArea.height;
    }

    /**
     * Configure the ScrollArea width/height ranges.
     */
    public setScrollRange (width?: number, height?: number): void {
        this.scrollArea.width = clamp(width || this.scrollArea.width, 0, Number.POSITIVE_INFINITY);
        this.scrollArea.height = clamp(height || this.scrollArea.height, 0, Number.POSITIVE_INFINITY);

        this.updateMaximumScrollOffsets();
    }

    /**
     * Sets the top/left scroll position.
     */
    public scrollTo (top?: number, left?: number): void {
        var translation: string = 'translate(' + -left + 'px, ' + -top + 'px)';
        this._scrollTop = top || this._scrollTop;
        this._scrollLeft = left || this._scrollLeft;

        this.$content.transform(translation);
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
     * Clamps the current scroll top/left values to within the maximum ranges.
     */
    private clampScrollOffsets (): void {
        this._scrollTop = clamp(this.scrollTop, 0, this._maxScrollTop);
        this._scrollLeft = clamp(this.scrollLeft, 0, this._maxScrollLeft);
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
     * Caches the maximum scroll top/left values for boundary checks.
     */
    private updateMaximumScrollOffsets (): void {
        this._maxScrollTop = Math.max(0, this.scrollArea.height - this.visibleArea.height);
        this._maxScrollLeft = Math.max(0, this.scrollArea.height - this.visibleArea.width);
    }
}