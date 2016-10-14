import QueryCache from "core/dom/QueryCache";
import QueryEventManager from "core/dom/QueryEventManager";
import * as u from "core/system/Utilities";
import * as Types from "core/system/Types";

/**
 * @ private interface QueryFilter
 * 
 * A type signature for an object describing element characteristics specified by a query selector.
 */
interface QueryFilter {
    /**
     * The element tag name.
     */
    tag: string,

    /**
     * The element ID.
     */
    id: string,

    /**
     * The element classes.
     */
    classes: Array<string>
}

/**
 * @ private var $events
 * 
 * A single QueryEventManager instance used to store and manage all event delegation for Query instances.
 */
var $events: QueryEventManager = new QueryEventManager();

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
    private stack: Query;
    private elements: Array<Element>;
    public length: number;
    public selector: string;

    /**
     * Constructor.
     */
    constructor (selector: string | Array<Element>, stack: Query = null) {
        if (u.isArray(selector)) {
            this.initFromArray(<Array<Element>>selector);
        } else {
            this.initFromSelector(<string>selector);
        }

        this.length = this.elements.length;
        this.stack = stack;
    }

    /**
     * Returns the direct parent element(s) of the queried element(s).
     */
    public parent (): Query {
        return this.parents();
    }

    /**
     * Returns the first parent/ancestor element(s) of the queried element(s) matching a selector,
     * or the immediate parent element(s) when no selector is specified.
     */
    public parents (selector: string = ''): Query {
        var parents: Array<Element> = [];
        var filter: QueryFilter = this.getQueryFilter(selector);

        u.each(this.elements, (element: Element) => {
            let parent: Element = element.parentElement;

            while (parent) {
                if (selector === '') {
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
     * Binds an event handler to the queried element(s).
     */
    public on (event: string, handler: (e: Event) => any): Query {
        u.each(this.elements, (element: Element) => {
            element.addEventListener(event, handler);
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
     * Initializes the Query instance from an array of elements.
     * @private
     */
    private initFromArray (elements: Array<Element>) {
        this.elements = elements;
    }

    /**
     * Initializes the Query instance from a selector string.
     * @private
     */
    private initFromSelector (selector: string) {
        var elements: NodeList = document.querySelectorAll(selector);

        this.elements = u.toArray(elements);
        this.selector = selector;
    }

    /**
     * Determines whether an element possesses all characteristics specified by a QueryFilter.
     * @private
     */
    private hasFilterMatch (element: Element, filter: QueryFilter): boolean {
        if (filter.tag && element.tagName !== filter.tag) {
            return false;
        }

        if (filter.id && element.id !== filter.id) {
            return false;
        }

        if (filter.classes.length > 0) {
            if (!u.intersects(filter.classes, u.toArray(element.classList))) {
                return false;
            }
        }

        return true;
    }

    /**
     * Returns a QueryFilter object from a selector string.
     * @private
     */
    private getQueryFilter (selector: string = ''): QueryFilter {
        return {
            tag: this.getTag(selector),
            id: this.getId(selector),
            classes: this.getClasses(selector)
        };
    }

    /**
     * Returns the tag name from a query selector, or null if none is specified.
     * @private
     */
    private getTag (selector: string): string {
        var tag: string = selector.split('#')[0].split('.')[0];

        return (tag !== '' ? tag : null);
    }

    /**
     * Returns the id from a query selector, or null if none is specified.
     * @private
     */
    private getId (selector: string): string {
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
     * @private
     */
    private getClasses (selector: string): Array<string> {
        var classChunks: Array<string> = selector.split('.').slice(1);
        var classes: Array<string> = [];

        u.each(classChunks, (chunk: string) => {
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