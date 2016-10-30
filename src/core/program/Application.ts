import $, { Query } from "core/dom/Query";
import View from "core/program/View";

import { each } from "core/system/Utilities";
import { Hash } from "core/system/Types";

/**
 * @ public abstract class Application
 * 
 * A basic shell for program Application instances. An Application is essentially a controller
 * and View manager used to mediate high-level program state changes and operations.
 */
abstract class Application {
    /* @ The container Element for the Application. */
    protected container: Element;
    /* @ The Query representation of the Application container. */
    protected $container: Query;
    /* @ The Views added to the Application. */
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
     * Attaches all added Views to the Application container Element.
     */
    public attachViews (): void {
        each(this.views, (view: View) => {
            view.attachTo(this.container);
        });
    }

    /**
     * Attaches the Application container to the document.
     */
    public attachTo (selector: string | Element | Query): void {
        $(selector).html('').append(this.container);
    }

    /**
     * Adds a new View to the Application Views list.
     */
    public addView (view: View): void {
        this.views.push(view);
    }
}

export default Application;