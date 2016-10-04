export = Sequencer;

import ClickAction from "../src/action/ClickAction";

class Sequencer {
	public static main (): void {
		console.log("Initialized.");

		var clickAction: ClickAction = new ClickAction(10, 20);

		console.log(clickAction);
	}
}