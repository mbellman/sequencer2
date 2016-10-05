import { ActionT } from "core/Constants";

abstract class Action {
	public type: ActionT;
	public timestamp: number;

	constructor () {
		this.timestamp = Date.now();
	}
}

export default Action;