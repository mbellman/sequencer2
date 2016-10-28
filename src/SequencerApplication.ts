import Application from "core/program/Application";
import View from "core/program/View";
import MenuBarView from "views/MenuBarView";
import ChannelView from "views/ChannelView";

export default class SequencerApplication extends Application {
    constructor () {
        super('sequencer');
    }

    /**
     * Starts up the sequencer.
     */
    public start (): void {
        super.attach('main.sequencer');
        super.addView(new MenuBarView(), 'menu');
        super.addView(new ChannelView(), 'channel');
        this.setupMenuBar();
        super.boot();
    }

    /**
     * Builds the sequencer menu bar at the top of the page.
     */
    private setupMenuBar (): void {
        var menu: MenuBarView = <MenuBarView>super.getView('menu');

        menu.render();
        menu.addOption('File');
        menu.addOption('Options');
        menu.addOption('Edit');
    }
}