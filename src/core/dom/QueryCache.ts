import HashTable from "core/system/HashTable";
import Time from "core/system/Time";

import { Query } from "core/dom/Query";

/**
 * @ private interface QueryLog
 * 
 * A type signature for cached/timestamped Query instances.
 */
interface QueryLog {
    /* @ The Query instance. */
    query: Query;
    /* @ The last lookup time in Unix Epoch milliseconds. */
    time: number;
}

/**
 * @ public class QueryCache
 * 
 * A periodically self-culling list of recent DOM queries.
 */
export default class QueryCache extends HashTable<QueryLog> {
    /* @ An interval timer for clean(). */
    private cleaner: number;

    constructor () {
        super();

        this.cleaner = window.setInterval(this.clean, 10000);
    }

    /**
     * Caches a Query instance using its associated selector as a lookup key.
     */
    public save (query: Query): void {
        super.store(query.selector, {
            query: query,
            time: Date.now()
        });
    }

    /**
     * Retrieves the Query from a cached QueryLog by selector lookup key, updating
     * the QueryLog's timestamp value to extend its life cycle in the cache.
     */
    public getQuery (selector: string): Query {
        super.retrieve(selector).time = Date.now();

        return super.retrieve(selector).query;
    }

    /**
     * Periodically dereference stored QueryLogs for queries which haven't been made in a while.
     */
    private clean (): void {
        super.each((log: QueryLog, key: string) => {
            if (Time.since(log.time) > 60000) {
                super.delete(key);
            }
        });
    }
}