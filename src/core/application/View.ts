import DOM from "core/dom/DOM";
import $, { Query } from "core/dom/Query";

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
    /* @ An ID to set on the rendered Element. */
    public id: string;
    /* @ The attach() selector target for the View. */
    private target: Query;
    /* @ A boolean representing whether the Element has been rendered. */
    private rendered: boolean = false;

    /**
     * Renders the View Element.
     */
    public render (): void {
        this.element = DOM.create('div', this.template);

        if (this.id) {
            this.element.setAttribute('id', this.id);
        }

        this.$element = new Query([this.element]);
        this.rendered = true;
    }

    /**
     * Attaches the View to one or multiple Elements designated by a Query selector.
     */
    public attach (selector: string | Query): void {
        if (!this.rendered) {
            this.render();
        }

        this.target = $(selector);

        this.target.append(this.element);
    }

    /**
     * Detaches the View from its parent Element(s).
     */
    public detach (): void {
        this.target.remove(this.element);
    }

    /**
     * Runs a Query search for selector-matching Element(s) inside the View Element.
     */
    public $ (selector: string): Query {
        return this.$element.find(selector);
    }
}