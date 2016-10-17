import QueryCache from "core/dom/QueryCache";
import Data from "core/dom/Data";
import SyntheticEvent from "core/dom/SyntheticEvent";
import { EventHandler } from "core/system/Types";
import { each, toArray, intersects } from "core/system/Utilities";

/**
 * @ private interface QueryFilter
 * 
 * A type signature for an object describing element characteristics specified by a query selector.
 */
interface QueryFilter {
    tag: string;               // The element tag name.
    id: string;                // The element ID.
    classes: Array<string>;    // The element classes.
}

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
    public length: number;               // The length of the DOM Element collection.
    public selector: string;             // The selector used for the Query, if applicable.
    private stack: Query;                // The previous Query in the stack, retrievable via pop().
    private elements: Array<Element>;    // The Query's collection of DOM Elements.

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
        var filter: QueryFilter = this.getQueryFilter(selector);

        each(this.elements, (element: Element) => {
            let parent: Element = element.parentElement;

            while (parent) {
                if (!selector) {
                    parents.push(parent);
                    break;
                } else {
                    if (this.hasFilterMatch(parent, filter)) {
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
        each(this.elements, (element: Element) => {
            Data.addEventHandler(element, event, handler);
        });

        return this;
    }

    /**
     * Removes all event handlers from the queried Element(s).
     */
    public off (): Query {
        return this;
    }

    /**
     * Returns the previous Query in the stack chain if one exists; otherwise returns {this}.
     */
    public pop (): Query {
        return this.stack || this;
    }

    /**
     * Triggers all events of a specific type on the queried Elements.
     */
    public trigger (event: string): void {
        each(this.elements, (element: Element): void => {
            Data.triggerEvent(element, event, new SyntheticEvent(event));
        });
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
     * Creates a Data store entry for each Element in the Query.
     */
    private registerElements (): void {
        each(this.elements, (element: Element): void => {
            Data.register(element);
        });
    }

    /**
     * Determines whether an Element possesses all characteristics specified by a QueryFilter.
     */
    private hasFilterMatch (element: Element, filter: QueryFilter): boolean {
        if (filter.tag && element.tagName !== filter.tag) {
            return false;
        }

        if (filter.id && element.id !== filter.id) {
            return false;
        }

        if (filter.classes.length > 0) {
            if (!intersects(filter.classes, toArray(element.classList))) {
                return false;
            }
        }

        return true;
    }

    /**
     * Returns a QueryFilter object from a selector string.
     */
    private getQueryFilter (selector: string = ''): QueryFilter {
        return {
            tag: this.getQueryTag(selector),
            id: this.getQueryId(selector),
            classes: this.getQueryClasses(selector)
        };
    }

    /**
     * Returns the tag name from a query selector, or null if none is specified.
     */
    private getQueryTag (selector: string): string {
        var tag: string = selector.split('#')[0].split('.')[0];

        return (tag !== '' ? tag : null);
    }

    /**
     * Returns the id from a query selector, or null if none is specified.
     */
    private getQueryId (selector: string): string {
        var hashIndex: number = selector.indexOf('#');

        if (hashIndex === -1) {
            return null;
        }

        var idStart: number = hashIndex + 1;
        var idEnd: number = selector.indexOf('.', hashIndex);

        return selector.substring(idStart, idEnd);
    }

    /**
     * Returns the classes from a query selector as an Array of string values.
     */
    private getQueryClasses (selector: string): Array<string> {
        var classChunks: Array<string> = selector.split('.').slice(1);
        var classes: Array<string> = [];

        each(classChunks, (chunk: string) => {
            let name: string = chunk.split('#')[0];

            if (name !== '') {
                classes.push(name);
            }
        });

        return classes;
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