import Application from "core/program/Application";
import SequencerMenuView from "views/SequencerMenuView";
import DropdownMenuView from "views/DropdownMenuView";
import SequenceView from "views/SequenceView";

import { $, Query } from "core/dom/DOM";
import { View } from "core/program/View";

/* A space-separated list of all style themes for the sequencer. */
const STYLE_THEMES: string = 'main night';

/**
 * The primary Application controller for the sequencer.
 */
export default class SequencerApplication extends Application {
    /**
     * @constructor
     */
    constructor () {
        super('sequencer');

        this.setTheme('main');
    }

    /**
     * @override
     * @implementation (Application)
     */
    public initialize (): void {
        super.attachTo('main');
        super.addView(new SequencerMenuView(this));
        super.addView(new SequenceView(this));
        super.attachViews();
    }

    /**
     * Changes the style theme of the sequencer.
     */
    public setTheme (theme: string): void {
        $(this.container).removeClass(STYLE_THEMES)
            .addClass(theme);
    }
}