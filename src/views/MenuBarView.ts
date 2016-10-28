import $ from "core/dom/Query";
import View from "core/program/View";

import { MenuBarTemplate } from "templates/MenuBarTemplate";

/**
 * @ public class MenuBarView
 * 
 * The user interface for the sequencer's top menu bar.
 */
export default class MenuBarView extends View {
    /* @ The MenuBarView template. @override */
    public template: string = MenuBarTemplate;
    /* @ The total number of options added to the menu. */
    private options: number = 0;

    constructor () {
        super('menu-bar');
    }

    /**
     * Adds a new option to the menu.
     */
    public addOption (text: string): void {
        if (this.rendered) {
            var option: Element = this.createOption(text);

            this.$element.find('.row').append(option);
        }
    }

    /**
     * Creates an Element for a new menu option.
     */
    private createOption (text: string): Element {
        var option: Element = document.createElement('div');
        option.innerHTML = text;

        $(option)
            .attr('class', 'option')
            .attr('data-option', String(++this.options));

        return option;
    }
}