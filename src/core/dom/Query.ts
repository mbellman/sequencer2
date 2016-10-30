import QueryCache from "core/dom/QueryCache";
import Data from "core/dom/data/Data";
import EventListener from "core/dom/event/EventListener";
import ActionListener from "core/dom/action/ActionListener";
import EventStore from "core/dom/data/EventStore";

import { each, toArray, isInArray } from "core/system/Utilities";
import { Hash } from "core/system/Types";
import { ActionType } from "core/dom/action/Action";
import { EventHandler, ActionHandler } from "core/dom/Types";

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

    constructor (selector: string | Element | Array<Element>, stack: Query = null) {
        if (selector instanceof Element) {
            this.initFromArray([selector]);
        } else if (selector instanceof Array) {
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

        this.eachElement((element: Element) => {
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

        this.eachElement((element: Element) => {
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
        if (event) {
            var events: Array<String> = event.split(' ');

            if (events.length > 1) {
                each(events, (event: string) => {
                    this.off(event);
                });

                return this;
            }
        }

        var [ event, namespace ] = (event ? event.split('.') : [null, null]);

        this.eachElement((element: Element) => {
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
    public trigger (event: string, eventData: Hash<any> = {}): Query {
        var eventInstance: Event = new Event(event);

        each(eventData, (value: any, key: string) => {
            eventInstance[key] = value;
        });

        this.eachElement((element: Element) => {
            Data.getData(element).events.trigger(event, eventInstance);
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

        this.eachElement((element: Element) => {
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

        this.eachElement((element: Element) => {
            let children: Array<Element> = toArray(element.querySelectorAll(selector));

            found = found.concat(children);
        });

        return new Query(found, this);
    }

    /**
     * Sets the innerHTML for the queried Element(s).
     */
    public html (html: string): Query {
        this.eachElement((element: Element) => {
            element.innerHTML = html;
        });

        return this;
    }

    /**
     * Appends a new document Node to the queried Element(s).
     */
    public append (node: Element): Query {
        this.eachElement((element: Element) => {
            element.appendChild(node);
        });

        return this;
    }

    /**
     * Removes a child Node from the queried Element(s).
     */
    public remove (node: Element): Query {
        this.eachElement((element: Element) => {
            if (element.contains(node)) {
                element.removeChild(node);
            }
        });

        return this;
    }

    /**
     * Sets an attribute on the queried Element(s).
     */
    public attr (attribute: string, value: string): Query {
        this.eachElement((element: Element) => {
            element.setAttribute(attribute, value);
        });

        return this;
    }

    /**
     * Sets a css property on the queried Element(s).
     */
    public css (property: string, value: string): Query {
        this.eachElement((element: Element) => {
            let el: HTMLElement = <HTMLElement>element;

            el.style[property] = value;
        });

        return this;
    }

    /**
     * Sets a transform property on the queried Element(s).
     */
    public transform (transformation: string): Query {
        this.eachElement((element: Element) => {
            let el: HTMLElement = <HTMLElement>element;

            el.style.transform = transformation;
            el.style.webkitTransform = transformation;
        });

        return this;
    }

    /**
     * Returns a bounding ClientRect for the first element in the Query.
     */
    public bounds (): any {
        if (this.length > 0) {
            return this.elements[0].getBoundingClientRect();
        }

        return {};
    }

    /**
     * Returns a bounding rectangle for the first element in the Query relative to its parent Element.
     */
    public localBounds (): any {
        if (this.length > 0) {
            var parentBounds: any = this.parent().bounds();
            var bounds: any = this.bounds();

            return {
                top: bounds.top - parentBounds.left,
                left: bounds.left - parentBounds.left,
                bottom: bounds.bottom - parentBounds.top,
                right: bounds.right - parentBounds.left,
                width: bounds.width,
                height: bounds.height
            };
        }

        return {};
    }

    /**
     * Adds one or multiple space-separated classes to the queried Element(s).
     */
    public addClass (classes: string): Query {
        this.eachElement((element: Element) => {
            if (element.className !== '') {
                element.className += (' ' + classes);
            } else {
                element.className = classes;
            }
        });

        return this;
    }

    /**
     * Removes one or multiple space-separated classes from the queried Element(s).
     */
    public removeClass (classes: string): Query {
        var removedClasses: Array<string> = classes.split(' ');

        this.eachElement((element: Element) => {
            let currentClasses: Array<string> = element.className.split(' ');
            let newClasses: Array<string> = [];

            each(currentClasses, (currentClass: string) => {
                if (!isInArray(removedClasses, currentClass)) {
                    newClasses.push(currentClass);
                }
            });

            element.className = newClasses.join(' ');
        });

        return this;
    }

    /**
     * Determines whether the queried Element(s) have a specific class.
     */
    public hasClass (className: string): boolean {
        return !!each(this.elements, (element: Element): any => {
            let classes: Array<string> = element.className.split(' ');

            if (isInArray(classes, className)) {
                return true;
            }
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
     * Creates a Data store entry for each of the individual queried Element(s) if
     * one does not exist for that Element already.
     */
    private registerElements (): void {
        this.eachElement((element: Element): any => {
            Data.register(element);
        });
    }

    /**
     * Calls a handler function for each Element in the Query.
     */
    private eachElement (handler: (element: Element) => any): void {
        each(this.elements, handler);
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
export default function $ (selector: string | Element | Query): Query {
    if (selector instanceof Element) {
        return new Query(selector);
    }

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