import { each } from "core/system/Utilities";
import { Hash } from "core/system/structures/Types";

/**
 * An object which facilitates arbitrary event handler delegation.
 */
export interface IEventManager {
    /* Delegates a handler function for an event. */
    on (...args: Array<any>): void;

    /* Removes delegated handlers for an event. */
    off (...args: Array<any>): void;

    /* Fires all delegated handlers for an event. */
    trigger (...args: Array<any>): void;
}

/**
 * A generic store and dispatch mechanism for custom events.
 */
export class EventManager implements IEventManager {
    /* A Hash of event handler function Arrays for each delegated event. */
    protected events: Hash<Array<Function>> = {};

    /**
     * Registers a handler for a specific event.
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

/**
 * An object which includes an internal EventManager, using a public on() method
 * to delegate event handlers on the EventManager.
 */
export abstract class EventContainer {
    /* An internal event store facilitated by an EventManager instance. */
    protected abstract events: EventManager;

    /* Delegates a handler function for an event. */
    public abstract on (...args: Array<any>): void;
}