import { Point, Rect } from "core/system/math/Geometry";

/**
 * Colorable
 */
interface Colorable {
    /* The color of the Colorable object. */
    color?: string;
}

/**
 * Stroke
 */
interface Stroke extends Colorable {
    /* The thickness of the Stroke object. */
    thickness?: number;
}

/**
 * Strokable
 */
interface Strokable {
    /* The Stroke object defining the stroke style of the Strokable object. */
    stroke?: Stroke;
}

/**
 * CanvasRect
 */
interface CanvasRect extends Rect, Colorable, Strokable {}

/**
 * CanvasCircle
 */
interface CanvasCircle extends Point, Colorable, Strokable {
    /* The radius of the CanvasCircle object. */
    radius: number;
}

/**
 * CanvasArc
 */
interface CanvasArc extends CanvasCircle {
    /* The coverage angle of the CanvasArc object. */
    angle: number;
}

/**
 * Provides an API for Canvas rendering operations.
 */
export default class Canvas {
    /* The Canvas element. */
    private element: HTMLCanvasElement;

    /* The Canvas rendering context. */
    private context: CanvasRenderingContext2D;

    /**
     * @constructor
     */
    constructor (element: Element) {
        this.element = <HTMLCanvasElement>element;
        this.context = this.element.getContext('2d');
    }

    /**
     * @getter {width}
     */
    get width (): number {
        return this.element.width;
    }

    /**
     * @getter {height}
     */
    get height (): number {
        return this.element.height;
    }

    /**
     * Updates the Canvas size.
     */
    public setSize (width: number, height: number): Canvas {
        this.element.style.width = width + 'px';
        this.element.style.height = height + 'px';

        return this;
    }

    /**
     * Fills the Canvas with a solid color.
     */
    public setBackground (color: string): Canvas {
        this.drawRect({x: 0, y: 0, width: this.width, height: this.height, color: color});

        return this;
    }

    public setFill (color: string): Canvas {
        this.context.fillStyle = color;

        return this;
    }

    /**
     * Draws a rectangle.
     */
    public drawRect (rect: CanvasRect): Canvas {
        this.context.rect(rect.x, rect.y, rect.width, rect.height);

        if (rect.color) {
            this.setFill(rect.color);
            this.context.fill();
        }

        return this;
    }

    /**
     * Clears a region on the Canvas.
     */
    public clearRect (rect: Rect): Canvas {
        this.context.clearRect(rect.x, rect.y, rect.width, rect.height);

        return this;
    }

    /**
     * Draws a circle.
     */
    public drawCircle (circle: CanvasCircle): Canvas {
        var arc: CanvasArc = <CanvasArc>circle;
        arc.angle = 2 * Math.PI;

        this.drawArc(arc);

        return this;
    }

    /**
     * Draws a partial circular arc.
     */
    public drawArc (arc: CanvasArc): Canvas {
        this.context.arc(arc.x, arc.y, arc.radius, 0, arc.angle);

        return this;
    }
}