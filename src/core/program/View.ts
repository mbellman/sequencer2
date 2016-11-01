import { $, Query } from "core/dom/query/Query";

/**
 * Scrollable
 */
export interface Scrollable {
    onScroll (): void;
}

/**
 * Resizable
 */
export interface Resizable {
    onResize (): void;
}

/**
 * A basic shell for application Views. Each View represents a reusable block of HTML content
 * and associated functionality which can be freely attached to the document.
 */
export abstract class View {
    /* The rendered View Element. */
    public element: Element;
    public $element: Query;

    /* A Query representation of the target Element(s) the View is attached to via attachTo(). */
    protected $target: Query;

    /* The View HTML content. */
    protected template: string;

    /* Whether the View has been rendered. */
    protected isRendered: boolean = false;

    /* Space-separated classes to set on the rendered Element. */
    private classes: string;

    /* An ID to set on the rendered Element. */
    private id: string;

    constructor (classes: string = null, id: string = null) {
        this.classes = classes;
        this.id = id;
    }

    /**
     * Overridable View render event handler.
     */
    public onRender (): void {}

    /**
     * Overridable View attach event handler.
     */
    public onAttach (): void {}

    /**
     * Overridable View detach event handler.
     */
    public onDetach (): void {}

    /**
     * Renders the View Element.
     */
    public render (elementType: string = 'div'): void {
        if (this.isRendered) {
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

        this.isRendered = true;

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