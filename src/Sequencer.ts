import $ from "core/dom/Query";

import { ActionType } from "core/action/Action";
import { ClickAction } from "core/action/MouseActions";

/**
 * @ class Sequencer
 * 
 * The program entry point.
 */
class Sequencer {
	public static main (): void {
		console.log("Initialized.");

		$('.hello').react(ActionType.RIGHT_CLICK, (d: ClickAction) => {
			console.log(d);
		});
	}
}

export = Sequencer;