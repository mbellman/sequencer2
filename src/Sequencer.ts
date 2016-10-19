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

		$('.hello').on('click -> #goodbye', function (e) {
			console.log('Click!');
		});

		$('.hello').on('click.space -> #goodbye', function (e) {
			console.log('Clicky!');

			$(this).off('click.space');
		});
	}
}

export = Sequencer;