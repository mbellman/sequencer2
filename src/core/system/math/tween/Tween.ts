import { bindAll } from "core/system/Utilities";
import { EasingFunction } from "core/system/math/tween/Ease";

interface TweenParameters {
    start: number;
    end: number;
    duration: number;
    ease: EasingFunction;
    onUpdate: TweenHandler;
    onComplete?: Function;
}

/**
 * An update function to run on each TweenAction update cycle.
 */
type TweenHandler = (value: number) => void;

/**
 * @ private class TweenAction
 */
class TweenAction {
    private startValue: number;
    private endValue: number;
    private range: number;
    private startTime: number;
    private easeDuration: number;
    private easeFunction: EasingFunction;
    private onUpdate: TweenHandler;
    private onComplete: Function;

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
 * An API for TweenAction operations.
 */
export default class Tween {
    public static run (params: TweenParameters): void {
        new TweenAction(params);
    }
}