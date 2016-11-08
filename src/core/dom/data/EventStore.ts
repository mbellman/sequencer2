import { each } from "core/system/Utilities";
import { Hash } from "core/system/structures/Types";
import { DOMEventHandler, DOMHandlerQueue, DOMHandlerStore } from "core/dom/DOM";

/**
 * A Hash containing all DOMEventHandlers bound for an event for a document Element. Each key
 * represents an event namespace and each value is a DOMHandlerQueue of handlers for that namespace.
 */
type DOMEventHandlerTable = Hash<DOMHandlerQueue>;

/**
 * An event handler store and manager for individual Elements.
 */
export default class EventStore implements DOMHandlerStore {
    /* An internal store of DOMEventHandlerTables for each event bound to the Element. */
    private events: Hash<DOMEventHandlerTable> = {};

    /**
     * Adds a new event handler to the internal store for a specific event.
     * @implements (DOMHandlerStore)
     */
    public bind (event: string, namespace: string = 'default', handler: DOMEventHandler): void {
        this.validateEventStore(event, namespace);
        this.events[event][namespace].push(handler);
    }

    /**
     * Removes all event handlers for a particular event/namespace pair from the internal store.
     * @implements (DOMHandlerStore)
     */
    public unbind (event: string = null, namespace: string = 'default'): void {
        if (!event) {
            each(this.events, (table: DOMEventHandlerTable, event: string) => {
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
     * Dispatches all DOMEventHandler methods associated with an event.
     * @implements (DOMHandlerStore)
     */
    public fire (event: string, e: Event): void {
        var table: DOMEventHandlerTable = this.events[event];

        each(table, (handlers: DOMHandlerQueue) => {
            each(handlers, (handler: DOMEventHandler) => {
                handler(e);
            });
        });
    }

    /**
     * Determines whether any DOMEventHandlers are still bound on an event or its namespaces.
     */
    public has (event: string): boolean {
        var table: DOMEventHandlerTable = this.events[event];

        if (!table) {
            return false;
        }

        return !!each(table, (handlers: DOMHandlerQueue): any => {
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

        var table: DOMEventHandlerTable = this.events[event];

        if (!table[namespace]) {
            table[namespace] = [];
        }
    }
}