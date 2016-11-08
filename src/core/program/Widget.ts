import { defaultTo } from "core/system/Utilities";
import { EventsContainer } from "core/system/Event";
import { $, Query, DOMEventHandler, DOMActionHandler } from "core/dom/DOM";
import { ActionType } from "core/dom/action/Action";

/**
 * A basic shell for reusable UI components. Widgets are essentially lite-edition
 * Views, with more minimal functionality and an emphasis on interactivity.
 */
abstract class Widget extends EventsContainer {
    /* The Widget HTML content. */
    protected abstract template: string;

    /* A Query reference to the Widget element. */
    protected $widget: Query;

    /* Space-separated classes to set on Widget Element at render time. */
    private classes: string;

    /**
     * @constructor
     */
    constructor (classes: string = null) {
        super();

        this.classes = classes;
    }

    /**
     * Attaches the Widget to the Element(s) designated by a Query selector.
     */
    public embed (selector: string | Element | Query): void {
        this.render();

        $(selector).append(this.$widget.element(0));
    }

    /**
     * Overridable Widget render event handler.
     */
    protected onRender (): void {}

    /**
     * An alias for $widget.find().
     */
    protected $ (selector: string): Query {
        return this.$widget.find(selector);
    }

    /**
     * Renders the Widget.
     */
    private render (elementType: string = 'div'): void {
        var element: Element = document.createElement(elementType);

        this.$widget = $(element).html(this.template);

        if (this.classes) {
            this.$widget.attr('class', this.classes);
        }

        this.onRender();
    }
}

export default Widget;