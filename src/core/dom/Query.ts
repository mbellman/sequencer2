import Data from "core/dom/data/Data";
import EventListener from "core/dom/EventListener";
import QueryCache from "core/dom/QueryCache";
import SyntheticEvent from "core/dom/SyntheticEvent";

import { each, toArray, intersects } from "core/system/Utilities";
import { Hash, EventHandler } from "core/system/Types";

/**
 * @ private var $cache
 * 
 * A persistent QueryCache instance used to optimize DOM lookups.
 */
var $cache: QueryCache = new QueryCache();

/**
 * @ public class Query
 * 
 * A DOM selector and manipulation manager.
 */
export class Query {
    // The length of the DOM Element collection.
    public length: number;
    // The selector used for the Query, if applicable.
    public selector: string;
    // The previous Query in the stack, retrievable via pop().
    private stack: Query;
    // The Query's collection of DOM Elements.
    private elements: Array<Element>;

    constructor (selector: string | Array<Element>, stack: Query = null) {
        if (selector instanceof Array) {
            this.initFromArray(selector);
        } else {
            this.initFromSelector(selector);
        }

        this.registerElements();

        this.length = this.elements.length;
        this.stack = stack;
    }

    /**
     * Returns the direct parent Element(s) of the queried Element(s).
     */
    public parent (): Query {
        return this.parents();
    }

    /**
     * Returns the first parent/ancestor Element(s) of the queried Element(s) matching a selector,
     * or the immediate parent Element(s) when no selector is specified.
     */
    public parents (selector: string = null): Query {
        var parents: Array<Element> = [];

        each(this.elements, (element: Element) => {
            let parent: Element = element.parentElement;

            while (parent) {
                if (!selector) {
                    parents.push(parent);
                    break;
                } else {
                    if (parent.matches(selector)) {
                        parents.push(parent);
                    }
                }

                parent = parent.parentElement;
            }
        });

        return new Query(parents, this);
    }

    /**
     * Binds an event handler to the queried Element(s).
     */
    public on (event: string, handler: EventHandler): Query {
        var [ eventName, targetSelector ] = event.split(' -> ');
        handler = handler.bind(this);

        if (targetSelector) {
            handler = this.createTargetedHandler(handler, targetSelector);
        }

        each(this.elements, (element: Element) => {
            if (!EventListener.listening(element, eventName)) {
                EventListener.add(element, eventName);
            }

            Data.getData(element).events.bind(eventName, handler);
        });

        return this;
    }

    /**
     * Unbinds one or all events from the queried Element(s).
     */
    public off (event: string = null): Query {
        each(this.elements, (element: Element) => {
            EventListener.remove(element, event);
            Data.getData(element).events.unbind(event);
        });

        return this;
    }

    /**
     * Triggers all events of a specific type on the queried Elements.
     */
    public trigger (event: string): void {
        var [ event, namespace ] = event.split('.');

        each(this.elements, (element: Element) => {
            Data.getData(element).events.trigger(event, namespace, new SyntheticEvent(event));
        });
    }

    /**
     * Returns the previous Query in the stack chain if one exists; otherwise returns {this}.
     */
    public pop (): Query {
        return this.stack || this;
    }

    /**
     * Initializes the Query instance from an array of Elements.
     */
    private initFromArray (elements: Array<Element>): void {
        this.elements = elements;
    }

    /**
     * Initializes the Query instance from a selector string.
     */
    private initFromSelector (selector: string): void {
        var elements: NodeList = document.querySelectorAll(selector);
        this.elements = toArray(elements);
        this.selector = selector;
    }

    /**
     * Creates a Data store entry for each Element in the Query if
     * one does not exist for that Element already.
     */
    private registerElements (): void {
        each(this.elements, (element: Element) => {
            Data.register(element);
        });
    }

    /**
     * Returns a wrapper EventHandler function which only invokes the original
     * EventHandler when the event's target matches a specific selector.
     */
    private createTargetedHandler (handler: EventHandler, selector: string): EventHandler {
        return (e: Event) => {
            var target: Element = <Element>e.target;

            if (target.matches(selector)) {
                handler(e);
            }
        };
    }
}

/**
 * @ public function $
 * 
 * A factory function for Query instances.
 */
export default function $ (selector: string | Query): Query {
    if (selector instanceof Query) {
        return selector;
    }

    if ($cache.has(selector)) {
        return $cache.getQuery(selector);
    }

    var query: Query = new Query(selector);

    $cache.save(query);

    return query;
}