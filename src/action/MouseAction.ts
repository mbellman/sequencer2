import Action from "../action/Action";

abstract class MouseAction extends Action {
	public x: number;
	public y: number;

	constructor (x: number, y: number) {
		super();

		this.x = x;
		this.y = y;
	}
}

export default MouseAction;