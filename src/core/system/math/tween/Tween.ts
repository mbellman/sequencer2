import { bindAll, defaultTo } from "core/system/Utilities";
import { EasingFunction } from "core/system/math/tween/Ease";

/**
 * An update function to run on each TweenAction update cycle.
 */
type TweenHandler = (value: number) => void;

/**
 * Configuration options for a TweenAction instance.
 */
interface TweenParameters {
    /* The starting tween value. */
    start: number;

    /* The ending tween value. */
    end: number;

    /* The tween duration. */
    duration: number;

    /* The delay in milliseconds before starting the tween. */
    delay?: number;

    /* The easing function to use for the tween. */
    ease: EasingFunction;

    /**
     * A custom update function to run during the tween, taking in the current tween
     * value as its argument.
     */
    onUpdate: TweenHandler;

    /* A custom function to run once the tween completes. */
    onComplete?: Function;
}

/**
 * A custom value tween.
 */
export class TweenAction {
    /* The configuration parameters for the tween. */
    private parameters: TweenParameters;

    /* The delta between the tween start and end values, cached on construction. */
    private range: number;

    /* The start time of the tween in unix epoch milliseconds. */
    private startTime: number;

    /* Determines whether the tween has been stopped or finished. */
    private _isStopped: boolean = false;

    /**
     * @constructor
     */
    constructor (parameters: TweenParameters) {
        bindAll(this, 'onTween');

        parameters.duration *= 1000;
        parameters.delay = defaultTo(parameters.delay, 0) * 1000;

        this.parameters = parameters;
        this.range = parameters.end - parameters.start;
        this.startTime = Date.now();

        this.onTween();
    }

    /**
     * A public proxy to check the internal {_isStopped}.
     */
    public isStopped (): boolean {
        return this._isStopped;
    }

    /**
     * Stops the current TweenAction.
     */
    public stop (): void {
        this._isStopped = true;
    }

    /**
     * The TweenAction tween update cycle.
     */
    private onTween (): void {
        if (this.isDelayed()) {
            requestAnimationFrame(this.onTween);

            return;
        }

        var { start, duration, delay, ease, onUpdate } = this.parameters;

        var elapsedTime: number = this.getElapsedTime() - delay;
        var progressRatio: number = elapsedTime / duration;
        var easeValue: number = ease(progressRatio);
        var tweenValue: number = start + (easeValue * this.range);

        if (elapsedTime >= duration) {
            this.endTween();

            return;
        }

        onUpdate(tweenValue);

        if (!this.isStopped()) {
            requestAnimationFrame(this.onTween);
        }
    }

    /**
     * Finishes the TweenAction on the tween's end value once the elapsed tween
     * time reaches the duration configured in {parameters}.
     */
    private endTween (): void {
        var { end, onUpdate, onComplete } = this.parameters;

        this._isStopped = true;

        onUpdate(end);

        if (onComplete) {
            onComplete();
        }
    }

    /**
     * Returns the TweenAction's total elapsed time in milliseconds.
     */
    private getElapsedTime (): number {
        return Date.now() - this.startTime;
    }

    /**
     * Determines whether the TweenAction parameter delay is still active.
     */
    private isDelayed (): boolean {
        return this.parameters.delay > this.getElapsedTime();
    }
}

/**
 * An API for TweenAction operations.
 */
export class Tween {
    /**
     * Generates a new TweenAction with custom parameters.
     */
    public static run (parameters: TweenParameters): TweenAction {
        return new TweenAction(parameters);
    }
}