import { bindAll, defaultTo } from "core/system/Utilities";
import { EasingFunction } from "core/system/math/tween/Ease";

interface TweenParameters {
    start: number;
    end: number;
    duration: number;
    delay?: number;
    ease: EasingFunction;
    onUpdate: TweenHandler;
    onComplete?: Function;
}

/**
 * An update function to run on each TweenAction update cycle.
 */
type TweenHandler = (value: number) => void;

/**
 * TweenAction
 */
class TweenAction {
    private tween: TweenParameters;
    private range: number;
    private startTime: number;
    private isStopped: boolean = false;

    /**
     * @constructor
     */
    constructor (tween: TweenParameters) {
        bindAll(this, 'update');

        tween.duration *= 1000;
        tween.delay = defaultTo(tween.delay, 0) * 1000;

        this.tween = tween;
        this.range = tween.end - tween.start;
        this.startTime = Date.now();

        this.update();
    }

    public stop (): void {
        this.isStopped = true;
    }

    /**
     * 
     */
    private update (): void {
        if (this.isDelayed()) {
            requestAnimationFrame(this.update);

            return;
        }

        var { start, end, duration, delay, ease, onUpdate, onComplete } = this.tween;

        var elapsedTime: number = this.getElapsedTime() - delay;
        var easeProgress: number = elapsedTime / duration;
        var easeValue: number = ease(easeProgress);
        var newValue: number = start + (easeValue * this.range);

        if (elapsedTime > duration) {
            onUpdate(end);

            if (onComplete) {
                onComplete();
            }

            return;
        }

        onUpdate(newValue);

        if (!this.isStopped) {
            requestAnimationFrame(this.update);
        }
    }

    private isDelayed (): boolean {
        return this.tween.delay > this.getElapsedTime();
    }

    private getElapsedTime (): number {
        return Date.now() - this.startTime;
    }
}

/**
 * An API for TweenAction operations.
 */
export default class Tween {
    public static run (params: TweenParameters): TweenAction {
        return new TweenAction(params);
    }
}