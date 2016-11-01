import { each } from "core/system/Utilities";
import { Hash } from "core/system/structures/Types";

/**
 * An object which facilitates arbitrary event delegation.
 */
export interface EventDelegator {
    on (...args: Array<any>): void;
    off (...args: Array<any>): void;
    trigger (...args: Array<any>): void;
}

/**
 * Stores and dispatches handler functions for arbitrary events.
 */
export class EventManager implements EventDelegator {
    private events: Hash<Array<Function>> = {};

    /**
     * Registers an event handler.
     */
    public on (event: string, handler: Function): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(handler);
    }

    /**
     * Removes all handlers for an event.
     */
    public off (event: string): void {
        delete this.events[event];
    }

    /**
     * Triggers all handlers for an event, passing custom arguments into the handlers.
     */
    public trigger (event: string, ...args: Array<any>): void {
        each(this.events[event], (handler: Function) => {
            handler.apply(null, args);
        });
    }
}