import Time from "core/system/Time";
import * as U from "core/system/Utilities";
import HashTable from "core/system/HashTable";

/**
 * @ private interface QueryLog
 * 
 * The type signature for cached Queries.
 */
interface QueryLog {
    query: Query;
    timestamp: number;
}

/**
 * @ private class QueryCache
 * 
 * An periodically self-culling list of recent DOM queries.
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
     * Retrieves a stored QueryLog by selector.
     * @private
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
    constructor (selector: string | Array<Element>, stack?: Query) {
        if (U.isArray(selector)) {
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
    public parents (selector: string = "", levels: number = Number.POSITIVE_INFINITY): Query {
        var parents: Array<Element> = [];
        var select: Object = this.parseSelector(selector);

        U.each(this.elements, (element: Element, index: number) => {
            let el = <Node>element;
            let cycles: number = 0;

            while ((el = el.parentNode) && cycles++ < levels) {
                if (!selector) {
                    parents.push(element);
                    break;
                } else {
                    // TODO: Check select.tag, select.id, and
                    // select.classes for parent node matches
                }
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
     * Returns the previous Query in the stack chain.
     */
    public pop (): Query {
        return this.stack || this;
    }

    /**
     * Initializes the Query instance from an array of elements.
     * @private
     */
    private initFromArray (selector: Array<Element>) {
        this.elements = selector;
    }

    /**
     * Initializes the Query instance from a selector string.
     * @private
     */
    private initFromSelector (selector: string) {
        var elements: NodeList = this.query(<string>selector);

        this.elements = Array.prototype.slice.call(elements, 0);
        this.selector = <string>selector;
    }

    /**
     * Returns one or multiple elements via document.querySelectorAll().
     * @private
     */
    private query (selector: string) {
        return document.querySelectorAll(selector);
    }

    /**
     * Returns an object describing the desired element attributes from a specified selector.
     * @private
     */
    private parseSelector (selector: string = ""): Object {
        var tag: string;
        var id: string;
        var classes: Array<string>;

        var startChar: string = selector.charAt(0);
        var hashIndex: number = selector.indexOf('#');
        var classChunks: Array<string> = selector.split('.').slice(1);

        // Parse selector element tag
        if (startChar !== '.' && startChar !== '#') {
            tag = selector.split('#')[0].split('.')[0];
        }

        // Parse selector element ID
        if (hashIndex > -1) {
            var idStart = hashIndex + 1;
            var idEnd = selector.indexOf('.', hashIndex);

            id = selector.substring(idStart, idEnd);
        }

        // Parse selector element classes
        U.each(classChunks, (chunk: string) => {
            classes.push(chunk.split('#')[0]);
        });

        return {
            tag: tag,
            id: id,
            classes: classes
        };
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
export function $ (selector: string | Query): Query {
    if (selector instanceof Query) {
        return selector;
    }

    if ($cache.has(selector)) {
        return $cache.getQuery(selector);
    }

    var query: Query = new Query(selector);

    $cache.store(selector, {
        query: query,
        timestamp: Date.now()
    });

    return query;
}