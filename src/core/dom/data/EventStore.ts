import { each } from "core/system/Utilities";
import { Hash, EventHandler, HandlerQueue } from "core/system/Types";

/**
 * @ public class EventStore
 * 
 * An event handler store and manager for individual Elements.
 */
export default class EventStore {
    private events: Hash<HandlerQueue> = {};    // The internal event handler store.

    /**
     * Adds a new event handler to the internal store for a specific event.
     */
    public bind (event: string, handler: EventHandler): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(handler);
    }

    /**
     * Removes one or all event handlers from the internal store for a specific event.
     */
    public unbind (event: string = null): void {
        if (!event) {
            each(this.events, (queue: HandlerQueue, name: string) => {
                this.unbind(name);
            });
        } else {
            this.events[event].length = 0;

            delete this.events[event];
        }
    }

    /**
     * Dispatches all event handlers for a specific event type.
     */
    public trigger (event: string, e: Event): void {
        var handlers: HandlerQueue = this.events[event];

        each(handlers, (handler: EventHandler) => {
            handler(e);
        });
    }
}