import { parseEventName } from "core/dom/Event";
import { each } from "core/system/Utilities";
import { Hash, HandlerQueue, EventHandler, ParsedEvent } from "core/system/Types";

/**
 * @ private type HandlerQueueTable
 * 
 * A type signature for a Hash of HandlerQueues.
 */
type HandlerQueueTable = Hash<HandlerQueue>;

/**
 * @ public class EventStore
 * 
 * An event handler store and manager for individual Elements.
 */
export default class EventStore {
    // The internal event handler store.
    private events: Hash<HandlerQueueTable> = {};

    /**
     * Adds a new event handler to the internal store for a specific event.
     */
    public bind (event: string, handler: EventHandler): void {
        var parsed: ParsedEvent = parseEventName(event);

        this.updateEventStore(parsed.event, parsed.namespace, handler);
    }

    /**
     * Removes one or all event handlers from the internal store for a specific event.
     */
    public unbind (event: string = null): void {
        if (!event) {
            each(this.events, (table: HandlerQueueTable, name: string) => {
                delete this.events[name];
            });
        } else {
            var parsed: ParsedEvent = parseEventName(event);

            if (!parsed.namespace) {
                delete this.events[parsed.event];
            } else {
                delete this.events[parsed.event][parsed.namespace];
            }
        }
    }

    /**
     * Dispatches all event handlers for a specific event type/namespace.
     */
    public trigger (event: string, e: Event, namespace: string = null): void {
        var handlers: HandlerQueue = this.events[event][namespace || 'default'];

        each(handlers, (handler: EventHandler) => {
            handler(e);
        });
    }

    /**
     * Adds an EventHandler to the internal store for a particular event/namespace combination.
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

        var table: HandlerQueueTable = this.events[event];

        if (!table[namespace]) {
            table[namespace] = [];
        }
    }
}