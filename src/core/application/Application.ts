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
    /* @ The Query representation of the Application container. */
    private $container: Query;
    /* @ The Views loaded in the Application. */
    private views: Array<View> = [];

    constructor (id: string = null) {
        this.container = DOM.create('div');
        this.$container = $(this.container);

        if (id) {
            this.$container.attr('id', id);
        }
    }

    /**
     * Attaches all Views to the Application container.
     */
    public start (): void {
        each(this.views, (view: View) => {
            view.attach(this.$container);
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