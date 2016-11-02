import Viewport from "core/dom/Viewport";
import SequencerApplication from "applications/SequencerApplication";

/**
 * The main program class.
 */
class Sequencer {
	/**
	 * The main program entry point.
	 */
	public static main (): void {
		var app = new SequencerApplication();

		app.initialize();
	}
}

export = Sequencer;