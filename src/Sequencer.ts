import Viewport from "core/dom/Viewport";
import SequencerApplication from "applications/SequencerApplication";

/**
 * The application entry point.
 */
class Sequencer
{
	public static main (): void {
		Viewport.initialize();

		var app = new SequencerApplication();

		app.initialize();
	}
}

export = Sequencer;