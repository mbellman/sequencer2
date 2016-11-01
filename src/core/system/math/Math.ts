export function square (n: number): number {
    return n * n;
}

export function magnitude (x: number, y: number): number {
    return Math.sqrt(x * x + y * y);
}

export function clamp (n: number, min: number, max: number): number {
    return (n < min ? min : (n > max ? max : n));
}

export function hasSameSign (n1: number, n2: number): boolean {
    return (n1 * n2 >= 0);
}