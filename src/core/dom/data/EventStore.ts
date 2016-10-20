import { each } from "core/system/Utilities";
import { Hash, HandlerQueue, EventHandler, ParsedEvent } from "core/system/Types";

/**
 * @ private type HandlerQueueTable
 * 
 * A type signature for a Hash table of HandlerQueues, where each key represents an event namespace
 * and the value is a HandlerQueue of EventHandlers for that namespace. A single HandlerQueueTable
 * type can be used to store all EventHandlers bound on an event and namespaces of that event.
 */
type HandlerQueueTable = Hash<HandlerQueue>;

/**
 * @ public class EventStore
 * 
 * An event handler store and manager for individual Elements.
 */
export default class EventStore {
    // An internal store of HandlerQueueTables for each event bound to the Element.
    private events: Hash<HandlerQueueTable> = {};

    /**
     * Adds a new event handler to the internal store for a specific event.
     */
    public bind (event: string, handler: EventHandler): void {
        var [ event, namespace ] = event.split('.');

        this.updateEventStore(event, namespace, handler);
    }

    /**
     * Removes one or all event handlers from the internal store for a specific event.
     */
    public unbind (event: string = null): void {
        if (!event) {
            each(this.events, (eventTable: HandlerQueueTable, event: string) => {
                delete this.events[event];
            });
        } else {
            var [ event, namespace ] = event.split('.');

            if (!namespace) {
                delete this.events[event];
            } else {
                delete this.events[event][namespace];
            }
        }
    }

    /**
     * Dispatches all event handlers for a specific event type/namespace pair.
     */
    public trigger (event: string, namespace: string = 'default', e: Event): void {
        var handlers: HandlerQueue = this.events[event][namespace];

        each(handlers, (handler: EventHandler) => {
            handler(e);
        });
    }

    /**
     * Adds an EventHandler to the internal store for a particular event type/namespace pair.
     */
    private updateEventStore (event: string, namespace: string = 'default', handler: EventHandler): void {
        this.validateEventStore(event, namespace);
        this.events[event][namespace].push(handler);
    }

    /**
     * Ensures that an event/namespace combination exists in the internal store before it is written to.
     */
    private validateEventStore (event: string, namespace: string = 'default'): void {
        if (!this.events[event]) {
            this.events[event] = {};
        }

        var eventTable: HandlerQueueTable = this.events[event];

        if (!eventTable[namespace]) {
            eventTable[namespace] = [];
        }
    }
}