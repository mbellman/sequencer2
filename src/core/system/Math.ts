export function square (n: number): number {
    return n * n;
}

export function magnitude (x: number, y: number): number {
    return Math.sqrt(x * x + y * y);
}

export function clamp (num: number, min: number, max: number): number {
    return (num < min ? min : (num > max ? max : num));
}