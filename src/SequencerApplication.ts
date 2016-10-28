import Application from "core/program/Application";
import MenuBarView from "views/MenuBarView";
import ChannelView from "views/ChannelView";

export default class SequencerApplication extends Application {
    constructor () {
        super('sequencer');
    }

    public start (): void {
        super.attach('main.sequencer');
        super.addView(new MenuBarView());
        super.addView(new ChannelView());
        super.boot();
    }
}