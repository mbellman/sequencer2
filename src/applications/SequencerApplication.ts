import $, { Query } from "core/dom/Query";
import Application from "core/program/Application";
import View from "core/program/View";
import SequencerMenuView from "views/SequencerMenuView";
import DropdownMenuView from "views/DropdownMenuView";
import SequenceView from "views/SequenceView";

/**
 * @ private const themes
 * 
 * A space-separated list of all style themes for the sequencer.
 */
const themes: string = 'main night';

/**
 * @ public class SequencerApplication
 */
export default class SequencerApplication extends Application {
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
        super.addView(new SequenceView(this));
        super.attachViews();
    }

    /**
     * Changes the style theme of the sequencer.
     */
    public setTheme (theme: string): void {
        this.$container.removeClass(themes)
            .addClass(theme);
    }
}