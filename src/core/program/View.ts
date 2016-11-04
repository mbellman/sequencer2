import { defaultTo } from "core/system/Utilities";
import { $, Query } from "core/dom/DOM";

/**
 * A basic shell for application Views. Each View represents a reusable block of HTML content
 * and associated functionality which can be freely attached to the document.
 */
abstract class View {
    /* The rendered View Element. */
    public element: Element;

    /* $(element). */
    public $element: Query;

    /* The target $(element) the View was attached to via attachTo(). */
    protected $target: Query;

    /* The View HTML content. */
    protected template: string;

    /* Determines whether the View has been rendered. */
    protected isRendered: boolean = false;

    /* Space-separated classes to set on View Element at render time. */
    private classes: string;

    /* An ID to set on the View Element at render time. */
    private id: string;

    /**
     * @constructor
     */
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
        this.$element = $(this.element).html(defaultTo(this.template, ''));

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

export default View;