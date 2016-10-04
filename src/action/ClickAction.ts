import MouseAction from "../action/MouseAction";
import { CLICK_ACTION } from "../core/Constants";

class ClickAction extends MouseAction {
	public type: string = CLICK_ACTION;

	constructor (x: number, y: number) {
		super(x, y);
	}
}

export default ClickAction;