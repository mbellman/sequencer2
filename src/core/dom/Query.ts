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
 * An internally cached list of recent DOM queries.
 */
class QueryCache extends HashTable<QueryLog> {
    private cleaner: number;

    constructor () {
        super();

        this.cleaner = window.setInterval(this.clean, 5000);
    }

    /**
     * Periodically dereference stored QueryLogs for queries which haven't been made in a while.
     */
    private clean (): void {
        super.each((query: QueryLog, key: string): any => {
            if (Time.since(query.timestamp) > 20000) {
                super.delete(key);
            }
        });
    }

    /**
     * Retrieves a stored QueryLog by selector.
     */
    public getQuery (selector: string): Query {
        super.retrieve(selector).timestamp = Date.now();

        return super.retrieve(selector).query;
    }
}

/**
 * @ private class Query
 * 
 * A DOM selector and manipulation manager.
 */
class Query {
    private elements: Array<Element>;
    public length: number;
    public selector: string;

    constructor (selector: string | Array<Element>) {
        if (U.isArray(selector)) {
            this.elements = <Array<Element>>selector;
        } else {
            var elements: NodeList = this.query(<string>selector);

            this.elements = Array.prototype.slice.call(elements, 0);
            this.selector = <string>selector;
        }

        this.length = this.elements.length;
    }

    private query (selector: string) {
        return document.querySelectorAll(selector);
    }

    public parent (selector?: string): Query {

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