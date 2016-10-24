import $ from "core/dom/Query";

/**
 * @ class Sequencer
 * 
 * The program entry point.
 */
class Sequencer {
	public static main (): void {
		console.log("Initialized.");

		var test = 0;

		$('.hello').on('click -> #goodbye', function (e) {
			console.log('Click!');

			if (++test > 5) {
				$(this).off('click');
			}
		});

		$('.hello').on('click.space -> #goodbye', function (e) {
			console.log('Clicky!');

			$(this).off('click.space');
		});
	}
}

export = Sequencer;