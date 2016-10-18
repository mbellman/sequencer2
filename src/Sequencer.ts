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

		$('body').on('mousedown -> #goodbye', function (e: Event) {
			console.log('Boom!');

			$(this).on('mousemove -> #goodbye', function (e: Event) {
				console.log('Draaag...');
			});

			$(this).on('mouseup', function () {
				$(this).off('mousemove').off('mouseup');
			});
		});
	}
}

export = Sequencer;