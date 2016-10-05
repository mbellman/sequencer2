import ActionManager from "core/action/ActionManager";

/**
 * @ class Sequencer
 * 
 * The program entry point.
 */
class Sequencer {
	public static main (): void {
		console.log("Initialized.");

		var actionManager = new ActionManager();
	}
}

export = Sequencer;