import $, { Query } from "core/dom/Query";

/**
 * @ public abstract class View
 * 
 * A basic shell for application Views. Each View represents a reusable block of HTML content
 * and associated functionality which can be freely attached to the document.
 */
abstract class View {
    /* @ The Element rendered from the View template. */
    public element: Element;
    /* @ The Query representation of the rendered Element. */
    public $element: Query;
    /* @ The View Element's innerHTML content. */
    protected template: string;
    /* @ The Query the View was appended to via attach(). */
    protected $target: Query;
    /* @ A boolean representing whether the Element has been rendered. */
    protected rendered: boolean = false;
    /* @ Space-separated classes to set on the rendered Element. */
    private classes: string;
    /* @ An ID to set on the rendered Element. */
    private id: string;

    constructor (classes: string = null, id: string = null) {
        this.classes = classes;
        this.id = id;
    }

    /**
     * Overridable render event handler.
     */
    public onRender (): void {}

    /**
     * Overridable attach event handler.
     */
    public onAttach (): void {}

    /**
     * Overridable detach event handler.
     */
    public onDetach (): void {}

    /**
     * Renders the View Element.
     */
    public render (elementType: string = 'div'): void {
        if (this.rendered) {
            return;
        }

        this.element = document.createElement(elementType);
        this.$element = $(this.element).html(this.template || '');

        if (this.classes) {
            this.$element.attr('class', this.classes);
        }

        if (this.id) {
            this.$element.attr('id', this.id);
        }

        this.rendered = true;

        this.onRender();
    }

    /**
     * Attaches the View to the Element(s) designated by a Query selector.
     */
    public attachTo (selector: string | Element | Query): void {
        this.render();

        this.$target = $(selector).append(this.element);

        this.onAttach();
    }

    /**
     * Detaches the View from its parent Element(s).
     */
    public detach (): void {
        this.$target.remove(this.element);
        this.onDetach();
    }

    /**
     * Runs a Query search for selector-matching Element(s) inside the View Element, Backbone-style.
     */
    public $ (selector: string): Query {
        return this.$element.find(selector);
    }
}

export default View;