/**
 * A type signature for easing functions.
 */
export type EasingFunction = (t: number) => number;

/**
 * A collection of unit easing functions.
 */
export namespace Ease {
    export function outQuad (t: number): number {
        return t*t;
    }

    export function inOutQuad (t: number): number {
        if (t < 0.5) {
            return 2*t*t;
        } else {
            return -1+(4-2*t)*t;
        }
    }

    export function inOutCubic (t: number): number {
        if (t < 0.5) {
            return 4*t*t*t;
        } else {
            return (t-1)*(2*t-2)*(2*t-2)+1;
        }
    }
}