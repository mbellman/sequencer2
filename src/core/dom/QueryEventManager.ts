import HashTable from "core/system/HashTable";
import { IEventManager } from "core/event/IEventManager";
import * as u from "core/system/Utilities";
import * as Types from "core/system/Types";

export default class QueryEventManager implements IEventManager {
    /**
     * An internal store of events/handlers delegated for unique Query instances.
     */
    private table: HashTable<any>;

    /**
     * Constructor.
     */
    constructor () {}

    /**
     * Saves a new event handler to a Query's unique events/handlers table.
     */
    public on (event: string, handler: Types.EventHandler, queryId: string): void {
        if (!this.table.has(queryId)) {
            this.table.store(queryId, {})
        }

        var events: any = this.table.retrieve(queryId);

        if (!u.hasOwn(events, event)) {
            events[event] = [];
        }

        events[event].push(handler);
    }

    /**
     * Fires all event-specific event handlers for a Query instance.
     */
    public trigger (event: string, e: Event, queryId: string): void {
        var handlers: Array<Types.EventHandler> = this.table.retrieve(queryId)[event];

        u.each(handlers, (handler: Types.EventHandler): void => {
            handler(e);
        });
    }
}