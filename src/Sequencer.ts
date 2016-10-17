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

		$('body').on('mousemove', (e: MouseEvent): void => {
			console.log(e.clientX, e.clientX);
		});

		$('body').on('click', (e: Event) => {
			console.log('Clicked!');

			$('body').off('click');
		});
	}
}

export = Sequencer;