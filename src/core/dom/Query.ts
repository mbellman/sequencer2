import QueryCache from "core/dom/QueryCache";
import EventListener from "core/event/EventListener";
import Data from "core/dom/data/Data";
import SyntheticEvent from "core/event/SyntheticEvent";
import EventStore from "core/dom/data/EventStore";
import ActionListener from "core/action/ActionListener";

import { each, toArray, intersects } from "core/system/Utilities";
import { Hash, EventHandler, ActionHandler } from "core/system/Types";
import { ActionType } from "core/action/Action";

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
    /* @ The length of the DOM Element collection. */
    public length: number;
    /* @ The selector used for the Query, if applicable. */
    public selector: string;
    /* @ The previous Query in the stack, retrievable via pop(). */
    private stack: Query;
    /* @ The Query's collection of DOM Elements. */
    private elements: Array<Element>;
    /* @ A table of boolean states for each ActionType representing whether or not
     * @ the Query has been bound with that particular action via react(). */
    private reacting: Hash<boolean> = {};

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
        var [ event, targetSelector ] = event.split(' -> ');
        var [ event, namespace ] = event.split('.');
        handler = handler.bind(this);

        if (targetSelector) {
            handler = this.createTargetedHandler(handler, targetSelector);
        }

        each(this.elements, (element: Element) => {
            if (!EventListener.listening(element, event)) {
                EventListener.add(element, event);
            }

            Data.getData(element).events.bind(event, namespace, handler);
        });

        return this;
    }

    /**
     * Unbinds one or all events from the queried Element(s).
     */
    public off (event: string = null): Query {
        var events: Array<String> = event.split(' ');

        if (events.length > 1) {
            each(events, (event: string) => {
                this.off(event);
            });

            return this;
        }

        var [ event, namespace ] = (event ? event.split('.') : [null, null]);

        each(this.elements, (element: Element) => {
            let eventStore: EventStore = Data.getData(element).events;

            eventStore.unbind(event, namespace);

            if (!namespace || !eventStore.has(event)) {
                EventListener.remove(element, event);
            }
        });

        return this;
    }

    /**
     * Triggers all events of a specific type on the queried Element(s).
     */
    public trigger (event: string): Query {
        each(this.elements, (element: Element) => {
            Data.getData(element).events.trigger(event, new SyntheticEvent(event));
        });

        return this;
    }

    /**
     * Delegates an ActionHandler to be fired for a particular Action on the queried Element(s).
     */
    public react (action: ActionType, handler: ActionHandler): Query {
        if (!this.reacting[action]) {
            ActionListener.add(this, action);

            this.reacting[action] = true;
        }

        each(this.elements, (element: Element) => {
            Data.getData(element).actions.bind(action, handler);
        });

        return this;
    }

    /**
     * Returns a new Query containing all Elements found within the queried Element(s)
     * matching a particular selector string.
     */
    public find (selector: string): Query {
        var found: Array<Element> = [];

        each(this.elements, (element: Element) => {
            let children: Array<Element> = toArray(element.querySelectorAll(selector));

            found.concat(children);
        });

        return new Query(found, this);
    }

    /**
     * Sets the innerHTML for the queried Element(s).
     */
    public html (html: string): Query {
        each(this.elements, (element: Element) => {
            element.innerHTML = html;
        });

        return this;
    }

    /**
     * Appends a new document Node to the queried Element(s).
     */
    public append (node: Element): Query {
        each(this.elements, (element: Element) => {
            element.appendChild(node);
        });

        return this;
    }

    /**
     * Removes a child Node from the queried Element(s).
     */
    public remove (node: Element): Query {
        each(this.elements, (element: Element) => {
            if (element.contains(node)) {
                element.removeChild(node);
            }
        });

        return this;
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
     * Creates a Data store entry for each of the individual queried Element(s) if
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