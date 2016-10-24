import { ActionType, Action } from "core/action/Action";
import { magnitude } from "core/system/Math";

/**
 * @ private abstract class MouseAction
 * 
 * The base representation of a user mouse action.
 */
abstract class MouseAction extends Action {
    /* @ The target Element on which the mouse action occurs. */
	public target: Element;
    /* @ The x coordinate of the mouse action. */
	public mouseX: number;
    /* @ The y coordinate of the mouse action. */
	public mouseY: number;

	constructor (type: ActionType, target: Element, mouseX: number, mouseY: number) {
		super(type);

		this.target = target;
		this.mouseX = mouseX;
		this.mouseY = mouseY;
	}
}

/**
 * @ public class ClickAction
 * 
 * A single-click action.
 */
export class ClickAction extends MouseAction {
	constructor (target: Element, mouseX: number, mouseY: number) {
		super(ActionType.CLICK, target, mouseX, mouseY);
	}
}

/**
 * @ public class MoveAction
 * 
 * A continuous mouse movement action.
 */
export class MoveAction extends MouseAction {
    /* @ The starting x coordinate of the move action. */
    public startX: number;
    /* @ The starting y coordinate of the move action. */
    public startY: number;
    /* @ The total x displacement of the move action. */
    public deltaX: number;
    /* @ The total y displacement of the move action. */
    public deltaY: number;

    constructor (target: Element, mouseX: number, mouseY: number) {
        super(ActionType.MOVE, target, mouseX, mouseY);

        this.startX = mouseX;
        this.startY = mouseY;
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
 * @ public class DragAction
 * 
 * A continuous mouse drag action.
 */
export class DragAction extends MoveAction {
    /* @ The running duration in milliseconds of the drag action, starting from the mouse down being held down. */
    public duration: number;
    /* @ The velocity of the drag action over the last tick. */
    public velocity: number;
    /* @ The x component of the last-tick-velocity vector. */
    public velocityX: number;
    /* @ The y component of the last-tick-velocity vector. */
    public velocityY: number;
    /* @ The timestamp of the last tick update. */
    private lastTime: number;
    /* @ The time progression, in milliseconds, over the last tick. */
    private dt: number;

    constructor (target: Element, x: number, y: number) {
        super(target, x, y);

        this.type = ActionType.DRAG;
        this.dt = this.timestamp;
    }

    /**
     * Updates the drag action with the most recent mouse x/y coordinates.
     * @override
     */
    public update (mouseX: number, mouseY: number): void {
        this.updateDeltaTime();
        this.trackVelocity(mouseX, mouseY);
        super.update(mouseX, mouseY);

        this.duration += this.dt;
    }

    /**
     * Keeps track of the time between tick updates.
     */
    private updateDeltaTime (): void {
        var time: number = Date.now();

        this.dt = time - this.lastTime;
        this.lastTime = time;
    }

    /**
     * Keeps track of the drag action velocity.
     */
    private trackVelocity (x: number, y: number): void {
        var dx: number = x - this.mouseX;
        var dy: number = y - this.mouseY;

        this.velocityX = dx / this.dt;
        this.velocityY = dy / this.dt;
        this.velocity = magnitude(this.velocityX, this.velocityY);
    }
}