import $, { Query } from "core/dom/Query";

/**
 * @ public abstract class View
 * 
 * A basic shell for application Views. Each View represents a reusable block of HTML content
 * and associated functionality which can be freely attached to the document.
 */
abstract class View {
    /* @ The View innerHTML content. */
    public template: string;
    /* @ The Element rendered from the View template. */
    public element: Element;
    /* @ The Query representation of the rendered Element. */
    public $element: Query;
    /* @ A boolean representing whether the Element has been rendered. */
    protected rendered: boolean = false;
    /* @ Space-separated classes to set on the rendered Element. */
    private classes: string;
    /* @ An ID to set on the rendered Element. */
    private id: string;
    /* @ The Query the View was appended to via attach(). */
    private $target: Query;

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

        this.element = document.createElement('div');
        this.element.innerHTML = this.template || '';
        this.$element = $(this.element);

        if (this.classes) {
            this.$element.attr('class', this.classes);
        }

        if (this.id) {
            this.$element.attr('id', this.id);
        }

        this.rendered = true;
    }

    /**
     * Attaches the View to the Element(s) designated by a Query selector.
     */
    public attach (selector: string | Element | Query): void {
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

export default View;