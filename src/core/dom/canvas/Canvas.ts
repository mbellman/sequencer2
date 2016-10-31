/**
 * @ private interface Point
 */
interface Point {
    /* @ The point x coordinate. */
    x: number;
    /* @ The point y coordinate. */
    y: number;
}

/**
 * @ private interface Size
 */
interface Size {
    /* @ The width of the size object. */
    width: number;
    /* @ The height of the size object. */
    height: number;
}

/**
 * @ private interface Rect
 */
interface Rect extends Point, Size {}

/**
 * @ private interface Colorable
 */
interface Colorable {
    /* @ The color of the colorable object. */
    color?: string;
}

/**
 * @ private interface Stroke
 */
interface Stroke extends Colorable {
    /* @ The thickness of the stroke object. */
    thickness?: number;
}

/**
 * @ private interface Strokable
 */
interface Strokable {
    /* @ The Stroke object defining the stroke style of the object. */
    stroke?: Stroke;
}

/**
 * @ private interface CanvasRect
 */
interface CanvasRect extends Rect, Colorable, Strokable {}

/**
 * @ private interface CanvasCircle
 */
interface CanvasCircle extends Point, Colorable, Strokable {
    /* @ The radius of the circle object. */
    radius: number;
}

/**
 * @ private interface CanvasArc
 */
interface CanvasArc extends CanvasCircle {
    /* @ The coverage angle of the arc object. */
    angle: number;
}

/**
 * @ public class Canvas
 * 
 * Provides an API for Canvas rendering operations.
 */
export default class Canvas {
    /* @ The Canvas pixel width. */
    public width: number;
    /* @ The Canvas pixel height. */
    public height: number;
    /* @ The Canvas element. */
    private element: HTMLCanvasElement;
    /* @ The Canvas rendering context. */
    private context: CanvasRenderingContext2D;

    constructor (element: HTMLElement | Element) {
        this.element = <HTMLCanvasElement>element;
        this.context = this.element.getContext('2d');
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