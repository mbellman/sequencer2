import SequencerApplication from "SequencerApplication";

/**
 * @ class Sequencer
 * 
 * The program entry point.
 */
class Sequencer {
	public static main (): void {
		var app = new SequencerApplication();

		app.start();
	}
}

export = Sequencer;