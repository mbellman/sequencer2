import Viewport from "core/dom/Viewport";
import SequencerApplication from "SequencerApplication";

/**
 * @ class Sequencer
 * 
 * The program entry point.
 */
class Sequencer {
	public static main (): void {
		Viewport.initialize();

		var app = new SequencerApplication();

		app.start();
	}
}

export = Sequencer;