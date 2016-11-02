/**
 * Returns a number squared.
 */
export function square (n: number): number {
    return n * n;
}

/**
 * Returns the magnitude of an x, y coordinate.
 */
export function magnitude (x: number, y: number): number {
    return Math.sqrt(x * x + y * y);
}

/**
 * Clamps a value to between a minimum and maximum.
 */
export function clamp (n: number, min: number, max: number): number {
    return n < min ? min : n > max ? max : n;
}

/**
 * Determines whether two numbers have the same sign.
 */
export function hasSameSign (n1: number, n2: number): boolean {
    return n1 * n2 >= 0;
}