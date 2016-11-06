export const enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

export interface Point {
    x: number;
    y: number;
}

export interface Area {
    width: number;
    height: number;
}

export interface Rect extends Point, Area {}

export interface Offset {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
}

export class Vector2 implements Point {
    public x: number;
    public y: number;

    constructor (x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public isNull (): boolean {
        return (this.x === 0 && this.y === 0);
    }

    public add (x: number, y: number): void {
        this.x += x;
        this.y += y;
    }

    public subtract (x: number, y: number): void {
        this.x -= x;
        this.y -= y;
    }

    public scale (scalar: number): void {
        this.x *= scalar;
        this.y *= scalar;
    }
}