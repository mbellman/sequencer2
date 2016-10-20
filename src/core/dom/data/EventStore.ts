import { each } from "core/system/Utilities";
import { Hash, HandlerQueue, EventHandler } from "core/system/Types";

/**
 * @ private type EventTable
 * 
 * A type signature for a structure containing all EventHandlers bound on an event for an Element.
 * Each key represents an event namespace and the value is a HandlerQueue of handlers for that namespace.
 */
type EventTable = Hash<HandlerQueue>;

/**
 * @ public class EventStore
 * 
 * An event handler store and manager for individual Elements.
 */
export default class EventStore {
    /* @ An internal store of EventTables for each event bound to the Element. */
    private events: Hash<EventTable> = {};

    /**
     * Adds a new event handler to the internal store for a specific event.
     */
    public bind (event: string, namespace: string = 'default', handler: EventHandler): void {
        this.validateEventStore(event, namespace);
        this.events[event][namespace].push(handler);
    }

    /**
     * Removes all event handlers for a particular event/namespace pair from the internal store.
     */
    public unbind (event: string = null, namespace: string = 'default'): void {
        if (!event) {
            each(this.events, (table: EventTable, event: string) => {
                delete this.events[event];
            });
        } else {
            if (!namespace || namespace === 'default') {
                delete this.events[event];
            } else {
                delete this.events[event][namespace];
            }
        }
    }

    /**
     * Dispatches each EventHandler method in each namespace for an event.
     */
    public trigger (event: string, e: Event): void {
        var table: EventTable = this.events[event];

        each(table, (handlers: HandlerQueue) => {
            each(handlers, (handler: EventHandler) => {
                handler(e);
            });
        });
    }

    /**
     * Determines whether any EventHandlers are still bound on an event or its namespaces.
     */
    public has (event: string): boolean {
        var table: EventTable = this.events[event];

        if (!table) {
            return false;
        }

        return !!each(table, (handlers: HandlerQueue): any => {
            if (handlers.length > 0) {
                return true;
            }
        });
    }

    /**
     * Ensures that an event/namespace combination exists in the internal store before it is written to.
     */
    private validateEventStore (event: string, namespace: string = 'default'): void {
        if (!this.events[event]) {
            this.events[event] = {};
        }

        var table: EventTable = this.events[event];

        if (!table[namespace]) {
            table[namespace] = [];
        }
    }
}