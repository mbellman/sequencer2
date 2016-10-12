import HashTable from "core/system/HashTable";
import Time from "core/system/Time";
import * as u from "core/system/Utilities";
import * as Types from "core/system/Types";

/**
 * @ private interface QueryLog
 * 
 * A type signature for cached/timestamped Query instances.
 */
interface QueryLog {
    query: Query;
    timestamp: number;
}

/**
 * @ private interface QueryFilter
 * 
 * A type signature for an object describing Element characteristics specified by a query selector.
 */
interface QueryFilter {
    tag: string,
    id: string,
    classes: Array<string>
}

/**
 * @ private class QueryCache
 * 
 * A periodically self-culling list of recent DOM queries.
 */
class QueryCache extends HashTable<QueryLog> {
    private cleaner: number;

    /**
     * Constructor.
     */
    constructor () {
        super();

        this.cleaner = window.setInterval(this.clean, 5000);
    }

    /**
     * Caches a Query instance using its associated selector as a lookup key.
     */
    public save (selector: string, query: Query): void {
        super.store(selector, {
            query: query,
            timestamp: Date.now()
        });
    }

    /**
     * Retrieves the Query from a cached QueryLog by selector lookup key, updating
     * the QueryLog's timestamp value to extend its life cycle in the cache.
     */
    public getQuery (selector: string): Query {
        super.retrieve(selector).timestamp = Date.now();

        return super.retrieve(selector).query;
    }

    /**
     * Periodically dereference stored QueryLogs for queries which haven't been made in a while.
     * @private
     */
    private clean (): void {
        super.each((query: QueryLog, key: string): any => {
            if (Time.since(query.timestamp) > 20000) {
                super.delete(key);
            }
        });
    }
}

/**
 * @ private class Query
 * 
 * A DOM selector and manipulation manager.
 */
class Query {
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
        return this.parents(undefined, 1);
    }

    /**
     * Returns the parent/ancestor element(s) of the queried element(s), optionally restricted by a selector.
     */
    public parents (selector: string = '', levels: number = Number.POSITIVE_INFINITY): Query {
        var parents: Array<Element> = [];
        var filter: QueryFilter = this.getQueryFilter(selector);

        u.each(this.elements, (element: Element) => {
            let parent: Element = element.parentElement;
            let cycles: number = 0;

            while (parent && cycles++ < levels) {
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
    public on (event: string, handler: () => void): Query {
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
 * @ private var $cache
 * 
 * A persistent QueryCache instance used to optimize DOM lookups.
 */
var $cache: QueryCache = new QueryCache();

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

    $cache.save(selector, query);

    return query;
}