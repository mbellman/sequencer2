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
    /* @ The Views loaded in the Application. */
    private views: Array<View> = [];
    /* @ Views added with a particular name identifier. */
    private namedViews: Hash<View> = {};

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
    public attach (selector: string | Element | Query): void {
        $(selector).html('').append(this.container);
    }

    /**
     * Adds a new View to the Application Views list.
     */
    public addView (view: View, name: string = null): void {
        this.views.push(view);

        if (name) {
            this.namedViews[name] = view;
        }
    }

    /**
     * Returns a View by its name identifier where applicable.
     */
    public getView (name: string): View {
        return this.namedViews[name];
    }
}

export default Application;