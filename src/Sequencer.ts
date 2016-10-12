import ActionManager from "core/action/ActionManager";
import $ from "core/dom/Query";

/**
 * @ class Sequencer
 * 
 * The program entry point.
 */
class Sequencer {
	public static main (): void {
		console.log("Initialized.");

		var query = $('#goodbye');
		var parents = query.parents('.hello');
		console.log(query);
		console.log(parents);
	}
}

export = Sequencer;