//import ActionManager from "core/action/ActionManager";
import $ from "core/dom/Query";

/**
 * @ class Sequencer
 * 
 * The program entry point.
 */
class Sequencer {
	public static main (): void {
		console.log("Initialized.");

		$('body').on('click', (e: Event) => {
			console.log(e);
		});

		$('body').on('click', (e: Event) => {
			console.log('Clicked!');
		});
	}
}

export = Sequencer;