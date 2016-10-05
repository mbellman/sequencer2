import Action from "core/action/Action";
import { CLICK_ACTION } from "core/Constants";

/**
 * @ private abstract class MouseAction
 */
abstract class MouseAction extends Action {
	public target: HTMLElement;
	public x: number;
	public y: number;

	constructor (target: HTMLElement, x: number, y: number) {
		super();

		this.target = target;
		this.x = x;
		this.y = y;
	}
}

/**
 * @ public class ClickAction
 */
export class ClickAction extends MouseAction {
	constructor (target: HTMLElement, x: number, y: number) {
		super(target, x, y);

		this.type = CLICK_ACTION;
	}
}

/**
 * @ public class MoveAction
 */
export class MoveAction extends MouseAction {
    public startX: number;
    public startY: number;
    public deltaX: number;
    public deltaY: number;

    constructor (target: HTMLElement, x: number, y: number) {
        super(target, x, y);

        this.startX = x;
        this.startY = y;
    }

    public update (x: number, y: number) {
        this.x = x;
        this.y = y;

        this.deltaX = this.x - this.startX;
        this.deltaY = this.y - this.startY;
    }
}

/**
 * @ public class DragAction
 */
export class DragAction extends MoveAction {
    constructor (target: HTMLElement, x: number, y: number) {
        super(target, x, y);
    }
}