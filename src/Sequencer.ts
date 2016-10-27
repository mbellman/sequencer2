import $ from "core/dom/Query";

import { ActionType } from "core/action/Action";
import { DoubleClickAction, DragAction } from "core/action/MouseActions";

/**
 * @ class Sequencer
 * 
 * The program entry point.
 */
class Sequencer {
	public static main (): void {
		console.log("Initialized.");

		$('.hello').react(ActionType.DRAG, (a: DragAction) => {
			if (a.duration < 500 && a.velocity > 6) {
				console.log('Swipe ' + a.direction + '!');
			}
		});

		$('.hello').react(ActionType.DOUBLE_CLICK, (a: DoubleClickAction) => {
			console.log(a.delay);
		});
	}
}

export = Sequencer;