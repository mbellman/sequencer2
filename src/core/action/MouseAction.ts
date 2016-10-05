import Action from "core/action/Action";

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

export default MouseAction;