import Data from "core/dom/data/Data";
import EventStore from "core/dom/data/EventStore";
import EventListenerManager from "core/dom/event/EventListenerManager";
import ActionListenerManager from "core/dom/action/ActionListenerManager";

import { each, isInArray, hasOwn, toArray } from "core/system/Utilities";
import { IEventManager } from "core/system/Event";
import { Hash } from "core/system/structures/Types";
import { ActionType, Action } from "core/dom/action/Action";
import { Tween } from "core/system/math/tween/Tween";
import { Ease } from "core/system/math/tween/Ease";

/**
 * A DOM event handler method fired by an event trigger.
 */
export type DOMEventHandler = (e: Event) => any;

/**
 * A handler method to be run on Action triggers (analagous
 * to DOMEventHandler methods on Events).
 */
export type DOMActionHandler = (action: Action) => any;

/**
 * An Array of EventHandlers or ActionHandlers.
 */
export type DOMHandlerQueue = Array<DOMEventHandler | DOMActionHandler>;

/**
 * A type signature for a list of event or action names (keys) and true boolean
 * values indicating that an event or action listener is bound for that event or
 * action. Leveraged by ActionListenerManager and EventListenerManager to avoid
 * redundant listener bindings on Elements or Queries.
 */
export type DOMListenerTable = Hash<boolean>;

/**
 * A manager and tracker for Event or Action listeners bound on Elements or Queries.
 */
export interface DOMListenerManager {
    /* Adds a listener to the Query or Element. */
    add (target: Element | Query, ...args: Array<any>): void;

    /* Removes a listener from the Query or Element. */
    remove (target: Element | Query, ...args: Array<any>): void;

    /* Determines whether an Event or Action is bound on an Element or Query. */
    isListening (target: Element | Query, ...args: Array<any>): boolean;
}

/**
 * A manager and dispatcher for DOM Event/Action handlers.
 */
export interface DOMHandlerStore {
    /* Binds a DOM handler to be fired on a specific DOM Event or Action. */
    bind (...args: Array<any>): void;

    /* Removes DOM handler bindings for a specific DOM Event or Action. */
    unbind (...args: Array<any>): void;

    /* Fires all DOM handlers for a specific Event or Action. */
    fire (...args: Array<any>): void;
}

/**
 * A DOM selector and manipulation manager.
 */
export class Query implements IEventManager {
    /* A persistent QueryCache instance used to optimize DOM lookups. */
    public static cache: Hash<Query> = {};

    /* The length of the queried Element(s) collection. */
    public length: number;

    /* The selector used for the Query, if applicable. */
    public selector: string;

    /* The previous Query in the stack, retrievable via pop(). */
    private stack: Query;

    /* The Query's collection of DOM Elements. */
    private elements: Array<Element>;

    /* A persistent EventListenerManager instance for event listener bindings on Elements. */
    private static eventListenerManager: EventListenerManager = new EventListenerManager();

    /* A persistent ActionListenerManager instance for Action bindings on Elements. */
    private static actionListenerManager: ActionListenerManager = new ActionListenerManager();

    /**
     * @constructor
     */
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
     * Returns the nth Element in the Query.
     */
    public element (index: number): Element {
        return this.elements[index];
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
     * @implements (IEventManager)
     */
    public on (event: string, handler: DOMEventHandler): Query {
        var [ event, targetSelector ] = event.split(' -> ');
        var [ event, namespace ] = event.split('.');
        handler = handler.bind(this);

        if (targetSelector) {
            handler = this.createTargetedHandler(handler, targetSelector);
        }

        this.eachElement((element: Element) => {
            if (!Query.eventListenerManager.isListening(element, event)) {
                Query.eventListenerManager.add(element, event);
            }

            Data.getData(element).events.bind(event, namespace, handler);
        });

        return this;
    }

    /**
     * Unbinds one or all events from the queried Element(s).
     * @implements (IEventManager)
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

        var [ event, namespace ] = (event ? event.split('.') : [ null, null ]);

        this.eachElement((element: Element) => {
            let eventStore: EventStore = Data.getData(element).events;

            eventStore.unbind(event, namespace);

            if (!namespace || !eventStore.has(event)) {
                Query.eventListenerManager.remove(element, event);
            }
        });

        return this;
    }

    /**
     * Triggers all events of a specific type on the queried Element(s).
     * @implements (IEventManager)
     */
    public trigger (event: string, eventData: Hash<any> = {}): Query {
        var eventInstance: Event = new Event(event);

        each(eventData, (value: any, key: string) => {
            eventInstance[key] = value;
        });

        this.eachElement((element: Element) => {
            Data.getData(element).events.fire(event, eventInstance);
        });

        return this;
    }

    /**
     * Delegates an DOMActionHandler to be fired for a particular Action on the queried Element(s).
     */
    public react (action: ActionType, handler: DOMActionHandler): Query {
        this.eachElement((element: Element) => {
            if (!Query.actionListenerManager.isListening(element, action)) {
                Query.actionListenerManager.add(element, action);
            }

            Data.getData(element).actions.bind(action, handler);
        });

        return this;
    }

    /**
     * Removes all Action/DOMActionHandler delegations from the queried Element(s).
     */
    public unreact (): Query {
        this.eachElement((element: Element) => {
            Query.actionListenerManager.remove(element);
            Data.getData(element).actions.unbind();
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
    public css (property: string, value: string | number): Query {
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
     * Returns the width of the first Element in the Query.
     */
    public width (): number {
        return this.length > 0 ? this.element(0).clientWidth : 0;
    }

    /**
     * Returns the height of the first Element in the Query.
     */
    public height (): number {
        return this.length > 0 ? this.element(0).clientHeight : 0;
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
     * Shows the queried Element(s).
     */
    public show (): Query {
        return this.css('display', 'initial');
    }

    /**
     * Hides the queried Element(s).
     */
    public hide (): Query {
        return this.css('display', 'none');
    }

    /**
     * Fades the queried Element(s) in from 0 opacity.
     */
    public fadeIn (duration: number = 0.5): Query {
        this.css('opacity', '0').show();

        Tween.run({start: 0, end: 1, ease: Ease.outQuad, duration: duration,
            onUpdate: (opacity: number) => {
                this.css('opacity', opacity);
            }
        });

        return this;
    }

    /**
     * Fades the queried Element(s) out from 1 to 0 opacity, hiding them after the fade completes.
     */
    public fadeOut (duration: number = 0.5): Query {
        this.css('opacity', '1');

        Tween.run({start: 1, end: 0, ease: Ease.outQuad, duration: duration,
            onUpdate: (opacity: number) => {
                this.css('opacity', opacity);
            },
            onComplete: () => {
                this.hide();
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
     * Returns a wrapper DOMEventHandler function which only invokes the original
     * DOMEventHandler when the event's target matches a specific selector.
     */
    private createTargetedHandler (handler: DOMEventHandler, selector: string): DOMEventHandler {
        return (e: Event) => {
            var target: Element = <Element>e.target;

            if (target.matches(selector)) {
                handler(e);
            }
        };
    }
}

/**
 * A factory function for Query instances.
 */
export function $ (selector: string | Element | Query): Query {
    if (selector instanceof Element) {
        return new Query(selector);
    }

    if (selector instanceof Query) {
        return selector;
    }

    if (hasOwn(Query.cache, selector)) {
        return Query.cache[selector];
    }

    var query: Query = new Query(selector);

    Query.cache[selector] = (query);

    return query;
}