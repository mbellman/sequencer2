import $, { Query } from "core/dom/Query";
import DOM from "core/dom/DOM";
import View from "core/application/View";

import { each } from "core/system/Utilities";

/**
 * @ public class Application
 */
export default class Application {
    /* @ The container Element for the Application. */
    private container: Element;
    /* @ The Views loaded in the Application. */
    private views: Array<View> = [];

    constructor (id: string = null) {
        this.container = DOM.create('div');

        if (id) {
            DOM.$(this.container).attr('id', id);
        }
    }

    /**
     * Attaches all Views to the Application container.
     */
    public start (): void {
        var $container: Query = new Query([this.container]);

        each(this.views, (view: View) => {
            view.attach($container);
        });
    }

    /**
     * Adds a new View to the Application Views list.
     */
    public addView (view: View): void {
        this.views.push(view);
    }

    /**
     * Attaches the Application container to the document.
     */
    public attach (selector: string | Query): void {
        $(selector).html('').append(this.container);
    }
}