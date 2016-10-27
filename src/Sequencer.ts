import Application from "core/application/Application";
import MenuBarView from "views/MenuBarView";
import ChannelView from "views/ChannelView";

/**
 * @ class Sequencer
 * 
 * The program entry point.
 */
class Sequencer {
	public static main (): void {
		console.log("Initialized.");
		
		var app: Application = new Application('sequencer');

		app.attach('main.sequencer');
		app.addView(new MenuBarView());
		app.addView(new ChannelView());
		app.start();
	}
}

export = Sequencer;