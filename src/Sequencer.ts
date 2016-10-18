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

		$('.hello').on('click -> #goodbye', (e: Event) => {
			console.log('Boom!');
		});
	}
}

export = Sequencer;