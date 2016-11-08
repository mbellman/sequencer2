import { magnitude } from "core/system/math/Utilities";
import { ActionType, Action } from "core/dom/action/Action";

/**
 * The base representation of a user mouse action.
 */
abstract class MouseAction extends Action {
    /* The target Element on which the mouse action occurs. */
	public target: Element;

    /* The x coordinate of the mouse action. */
	public mouseX: number;

    /* The y coordinate of the mouse action. */
	public mouseY: number;

    /**
     * @constructor
     */
	constructor (type: ActionType, e: MouseEvent) {
		super(type);

		this.target = <Element>e.target;
		this.mouseX = e.clientX;
		this.mouseY = e.clientY;
	}
}

/**
 * A single-click action.
 */
export class ClickAction extends MouseAction {
    /**
     * @constructor
     */
	constructor (e: MouseEvent) {
		super(ActionType.CLICK, e);
	}
}

/**
 * A double-click action.
 */
export class DoubleClickAction extends MouseAction {
    /* The delay in milliseconds between clicks. */
    public delay: number;

    /**
     * @constructor
     */
    constructor(e: MouseEvent, delay: number) {
        super(ActionType.DOUBLE_CLICK, e);

        this.delay = delay;
    }
}

/**
 * A mouse movement action after at least one second of inactivity.
 */
export class MoveAction extends MouseAction {
    /* The starting x coordinate of the move action. */
    public startX: number;

    /* The starting y coordinate of the move action. */
    public startY: number;

    /* The total x displacement of the move action. */
    public deltaX: number = 0;

    /* The total y displacement of the move action. */
    public deltaY: number = 0;

    /**
     * @constructor
     */
    constructor (e: MouseEvent) {
        super(ActionType.MOVE, e);

        this.startX = e.clientX;
        this.startY = e.clientY;
    }

    /**
     * Updates the current mouse x/y coordinates and tracks the total x/y displacement.
     */
    public update (mouseX: number, mouseY: number): void {
        this.mouseX = mouseX;
        this.mouseY = mouseY;

        this.deltaX = this.mouseX - this.startX;
        this.deltaY = this.mouseY - this.startY;
    }
}

/**
 * A continuous mouse drag action.
 */
export class DragAction extends MoveAction {
    /* The running duration in milliseconds of the drag action, starting from the mouse down being held down. */
    public duration: number = 0;

    /* A string representing the approximate direction of the drag action over the last tick ('up' | 'right' | 'left' | 'down'). */
    public direction: string;

    /* The velocity of the drag action over the last tick. */
    public velocity: number;

    /* The x component of the last-tick-velocity vector. */
    public velocityX: number;

    /* The y component of the last-tick-velocity vector. */
    public velocityY: number;

    /* Flipped to true when the mouse is released. */
    public ended: boolean = false;

    /* The timestamp of the last tick update. */
    private lastTime: number;

    /* The time progression, in milliseconds, over the last tick. */
    private dt: number;

    /**
     * @constructor
     */
    constructor (e: MouseEvent) {
        super(e);

        this.type = ActionType.DRAG;
        this.dt = this.lastTime = this.timestamp;
    }

    /**
     * Updates the drag action with the most recent mouse x/y coordinates.
     * @override
     */
    public update (mouseX: number, mouseY: number): void {
        this.updateDeltaTime();
        this.updateVelocity(mouseX, mouseY);
        this.updateDirection();

        super.update(mouseX, mouseY);

        this.duration += this.dt;
    }

    /**
     * Keeps track of the time between mouse updates.
     */
    private updateDeltaTime (): void {
        var time: number = Date.now();

        this.dt = time - this.lastTime;
        this.lastTime = time;
    }

    /**
     * Updates the current drag action {velocity} and velocity vector
     * components from an x/y value.
     */
    private updateVelocity (x: number, y: number): void {
        var dx: number = x - this.mouseX;
        var dy: number = y - this.mouseY;

        this.velocityX = dx / this.dt;
        this.velocityY = dy / this.dt;
        this.velocity = magnitude(this.velocityX, this.velocityY);
    }

    /**
     * Updates the current drag action {direction} based on velocity.
     */
    private updateDirection (): void {
        var absoluteVX: number = Math.abs(this.velocityX);
        var absoluteVY: number = Math.abs(this.velocityY);

        if (absoluteVX > absoluteVY) {
            this.direction = (this.velocityX < 0 ? 'left' : 'right');
        } else {
            this.direction = (this.velocityY < 0 ? 'up' : 'down');
        }
    }
}