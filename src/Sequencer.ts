import $ from "core/dom/Query";
import ChannelView from "views/ChannelView";

import { ActionType } from "core/action/Action";
import { DoubleClickAction, DragAction } from "core/action/MouseActions";

/**
 * @ class Sequencer
 * 
 * The program entry point.
 */
class Sequencer {
	public static main (): void {
		console.log("Initialized.");

		var channelView: ChannelView = new ChannelView();
		var channelView2: ChannelView = new ChannelView();

		channelView.attach('main.sequencer');
		channelView2.attach('main.sequencer');

		$('body').on('click', () => {
			channelView2.detach();
		});
	}
}

export = Sequencer;