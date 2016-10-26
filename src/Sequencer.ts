import $ from "core/dom/Query";

import { ActionType } from "core/action/Action";
import { DoubleClickAction } from "core/action/MouseActions";

/**
 * @ class Sequencer
 * 
 * The program entry point.
 */
class Sequencer {
	public static main (): void {
		console.log("Initialized.");

		$('.hello').react(ActionType.DOUBLE_CLICK, (d: DoubleClickAction) => {
			console.log(d);
		});
	}
}

export = Sequencer;