import $, { Query } from "core/dom/Query";
import DOM from "core/dom/DOM";

/**
 * @ public class View
 * 
 * A basic shell for application Views.
 */
export default class View {
    /* @ The View innerHTML content. */
    public template: string;
    /* @ The Element rendered from the View template. */
    public element: Element;
    /* @ The Query representation of the rendered Element. */
    public $element: Query;
    /* @ Space-separated classes to set on the rendered Element. */
    private classes: string;
    /* @ An ID to set on the rendered Element. */
    private id: string;
    /* @ The attach() selector target for the View. */
    private $target: Query;
    /* @ A boolean representing whether the Element has been rendered. */
    private rendered: boolean = false;

    constructor (classes: string = null, id: string = null) {
        this.classes = classes;
        this.id = id;
    }

    /**
     * Renders the View Element.
     */
    public render (): void {
        if (this.rendered) {
            return;
        }

        this.element = DOM.create('div', this.template);
        this.$element = new Query([this.element]);

        if (this.classes) {
            DOM.$(this.element).attr('class', this.classes);
        }

        if (this.id) {
            DOM.$(this.element).attr('id', this.id);
        }

        this.rendered = true;
    }

    /**
     * Attaches the View to the Element(s) designated by a Query selector.
     */
    public attach (selector: string | Query): void {
        this.render();

        this.$target = $(selector).append(this.element);
    }

    /**
     * Detaches the View from its parent Element(s).
     */
    public detach (): void {
        this.$target.remove(this.element);
    }

    /**
     * Runs a Query search for selector-matching Element(s) inside the View Element, Backbone-style.
     */
    public $ (selector: string): Query {
        return this.$element.find(selector);
    }
}