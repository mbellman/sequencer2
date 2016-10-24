export function square (n: number): number {
    return n * n;
}

export function sqrt (n: number): number {
    return Math.sqrt(n);
}

export function magnitude (x: number, y: number): number {
    return sqrt(x * x + y * y);
}