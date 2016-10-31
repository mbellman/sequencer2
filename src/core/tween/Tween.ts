import { bindAll } from "core/system/Utilities";
import { EaseFunction } from "core/tween/Ease";

/**
 * @ private interface TweenParameters
 */
interface TweenParameters {
    /* @ */
    start: number;
    /* @ */
    end: number;
    /* @ */
    duration: number;
    /* @ */
    ease: EaseFunction;
    /* @ */
    onUpdate: EaseHandler;
    /* @ */
    onComplete?: () => void;
}

/**
 * @ private type EaseHandler
 * 
 * An update function to run on each TweenAction update cycle.
 */
type EaseHandler = (value: number) => void;

/**
 * @ private class TweenAction
 */
class TweenAction {
    /* @ */
    private startValue: number;
    /* @ */
    private endValue: number;
    /* @ */
    private range: number;
    /* @ */
    private startTime: number;
    /* @ */
    private easeDuration: number;
    /* @ */
    private easeFunction: EaseFunction;
    /* @ */
    private onUpdate: EaseHandler;
    /* @ */
    private onComplete: () => void;

    constructor (params: TweenParameters) {
        bindAll(this, 'update');

        this.startValue = params.start;
        this.endValue = params.end;
        this.range = params.end - params.start;
        this.startTime = Date.now();
        this.easeDuration = params.duration * 1000;
        this.easeFunction = params.ease;
        this.onUpdate = params.onUpdate;

        if (params.onComplete) {
            this.onComplete = params.onComplete;
        }

        this.update();
    }

    /**
     * 
     */
    private update (): void {
        var elapsedTime: number = Date.now() - this.startTime;
        var easeProgress: number = elapsedTime / this.easeDuration;
        var easeValue: number = this.easeFunction(easeProgress);
        var newValue: number = this.startValue + (easeValue * this.range);

        if (elapsedTime > this.easeDuration) {
            this.onUpdate(this.endValue);

            if (this.onComplete) {
                this.onComplete();
            }

            return;
        }

        this.onUpdate(newValue);

        requestAnimationFrame(this.update);
    }
}

/**
 * @ public class Tween
 */
export default class Tween {
    /**
     * Creates a new TweenAction using a TweenParameters object.
     */
    public static run (params: TweenParameters): void {
        new TweenAction(params);
    }
}