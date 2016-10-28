import $, { Query } from "core/dom/Query";
import View from "core/program/View";

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

    constructor (classes: string = null, id: string = null) {
        this.container = document.createElement('div');
        this.$container = $(this.container);

        if (classes) {
            this.$container.attr('class', classes);
        }

        if (id) {
            this.$container.attr('id', id);
        }
    }

    /**
     * Attaches all Views to the Application container.
     */
    public boot (): void {
        each(this.views, (view: View) => {
            view.attach(this.$container);
        });
    }

    /**
     * Attaches the Application container to the document.
     */
    public attach (selector: string | Query): void {
        $(selector).html('').append(this.container);
    }

    /**
     * Adds a new View to the Application Views list.
     */
    public addView (view: View): void {
        this.views.push(view);
    }
}