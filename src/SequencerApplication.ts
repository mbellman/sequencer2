import $, { Query } from "core/dom/Query";
import Application from "core/program/Application";
import View from "core/program/View";
import SequencerMenuView from "views/SequencerMenuView";
import DropdownMenuView from "views/DropdownMenuView";

/**
 * @ public class SequencerApplication
 */
export default class SequencerApplication extends Application {
    /* @ A space-separated list of all style themes for the sequencer. */
    private themes: string = 'main';

    constructor () {
        super('sequencer');
        this.setTheme('main');
    }

    /**
     * Starts up the sequencer.
     */
    public start (): void {
        super.attachTo('main');
        super.addView(new SequencerMenuView(this));
        super.attachViews();
    }

    /**
     * Changes the style theme of the sequencer.
     */
    public setTheme (theme: string): void {
        this.$container
            .removeClass(this.themes)
            .addClass(theme);
    }
}