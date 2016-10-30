import Time from "core/system/Time";
import Tween from "core/tween/Tween";

import { clamp } from "core/system/Math";
import { Query } from "core/dom/Query";
import { Ease } from "core/tween/Ease";

/**
 * @ public class ScrollArea
 * 
 * Creates a virtual "scrollable" area on an element, overriding its DOM wheel
 * event and using manual top/left CSS positioning to represent scroll behavior.
 */
export default class ScrollArea {
    /* @ The current scroll top value. */
    public scrollTop: number = 0;
    /* @ The current scroll left value. */
    public scrollLeft: number = 0;
    /* @ A Query reference to the Element(s) to scroll. */
    private $scrollable: Query;
    /* @ The width of the scrollable container. */
    private areaWidth: number;
    /* @ The height of the scrollable container. */
    private areaHeight: number;
    /* @ The total scrollable width of the ScrollArea. */
    private scrollWidth: number;
    /* @ The total scrollable height of the ScrollArea. */
    private scrollHeight: number;
    /* @ The scrollTop value before the next scroll Tween. */
    private lastScrollTop: number = 0;
    /* @ The scrollLeft value before the next scroll Tween. */
    private lastScrollLeft: number = 0;
    private momentumX: number = 0;
    private momentumY: number = 0;
    private isScrolling: boolean = false;

    constructor ($listener: Query, $scrollable: Query) {
        var area: any = $listener.bounds();
        this.$scrollable = $scrollable;
        this.areaWidth = area.width;
        this.areaHeight = area.height;

        $listener.on('wheel', (e: WheelEvent) => {
            this.captureScrollEvent(e);
            e.stopPropagation();
        });
    }

    /**
     * Configures the ScrollArea width and height bounds.
     */
    public setScrollArea (width: number, height: number): void {
        this.scrollWidth = width;
        this.scrollHeight = height;
    }

    private isScrollThresholdMet (e: WheelEvent): boolean {
        return (Math.abs(this.momentumY) > Math.abs(e.deltaY * 5));
    }

    /**
     * Captures a new WheelEvent to control scroll actions.
     */
    private captureScrollEvent (e: WheelEvent): void {
        if (this.isScrolling) {
            return;
        }

        this.updateMomentumFromEvent(e);

        if (this.isScrollThresholdMet(e)) {
            this.updateScrollOffsets();
            this.scroll();
        }
    }

    private updateMomentumFromEvent (e: WheelEvent): void {
        this.momentumX += e.deltaX;
        this.momentumY += e.deltaY;
    }

    private updateScrollOffsets (): void {
        this.lastScrollTop = this.scrollTop;
        this.lastScrollLeft = this.scrollLeft;

        this.scrollTop += (this.momentumY * 20);
        this.scrollLeft += (this.momentumX * 20);

        this.boundScrollPosition();
    }

    private scroll (): void {
        this.isScrolling = true;

        Tween.run({
            start: this.lastScrollTop,
            end: this.scrollTop,
            duration: this.getScrollDuration(),
            ease: Ease.inOutQuad,
            onUpdate: (value: number) => {
                this.$scrollable.css('top', -value + 'px');
            },
            onComplete: () => {
                this.isScrolling = false;
            }
        });

        this.saveLastScrollOffsets();
        this.resetMomentum();
    }

    private getScrollDuration (): number {
        return Math.max(0.5, Math.abs(this.momentumY / 5));
    }

    /**
     * Ensures that the current scroll offsets do not extend beyond
     * the scrollable area width/height boundaries.
     */
    private boundScrollPosition (): void {
        var widthBuffer: number = this.scrollWidth - this.areaWidth;
        var heightBuffer: number = this.scrollHeight - this.areaHeight;

        this.scrollTop = clamp(this.scrollTop, 0, heightBuffer);
        this.scrollLeft = clamp(this.scrollLeft, 0, widthBuffer);
    }

    private saveLastScrollOffsets (): void {
        this.lastScrollTop = this.scrollTop;
        this.lastScrollLeft = this.scrollLeft;
    }

    private resetMomentum (): void {
        this.momentumX = 0;
        this.momentumY = 0;
    }
}