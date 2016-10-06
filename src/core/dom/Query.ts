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

        this.cleaner = window.setInterval(this.clean, 10000);
    }

    /**
     * Periodically dereference stored QueryLogs for queries which haven't been made in a while.
     */
    private clean (): void {

    }

    /**
     * Retrieves a stored QueryLog by selector.
     */
    public getQuery (selector: string): Query {
        this.retrieve(selector).timestamp = Date.now();

        return this.retrieve(selector).query;
    }
}

/**
 * @ private class Query
 * 
 * A DOM selector and manipulation manager.
 */
class Query {
    private cache: QueryCache;

    constructor (selector: string) {
        document.querySelector('lol');
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