import { clamp, hasSameSign } from "core/system/math/Utilities";
import { Point, Vector2 } from "core/system/math/Geometry";

/**
 * Represents a momentum vector.
 */
export class Momentum2 extends Vector2 {
    /**
     * @constructor
     */
    constructor (x: number, y: number) {
        super(0, 0);
    }

    /**
     * Reduces the momentum vector magnitude by a factor from [0 - 1],
     * rounding either component down to 0 when it drops below 0.1.
     */
    public decay (factor: number): void {
        super.scale(clamp(factor, 0, 1));

        if (Math.abs(this.x) < 0.1) {
            this.x = 0;
        }

        if (Math.abs(this.y) < 0.1) {
            this.y = 0;
        }
    }
}