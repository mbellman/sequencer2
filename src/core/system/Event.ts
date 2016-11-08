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
     * Removes a specific handler for an event, all handlers for an event, or all events.
     */
    public off (event?: string, handler?: Function): void {
        if (event && handler) {
            each(this.events[event], (fn: Function, index: number): any => {
                if (handler === fn) {
                    return this.events[event].splice(index, 1);
                }
            });

            return;
        }

        if (event && !handler) {
            delete this.events[event];
            return;
        }

        this.events = {};
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
 * An object which contains an internal EventManager, using public on() and off()
 * proxy methods to delegate or remove event handlers. Derived classes can call
 * this.events.trigger() internally. Used when a class can have events subscribed
 * to, but not manually triggered from outside the definition.
 */
export abstract class EventsContainer {
    /* An internal event store facilitated by an EventManager instance. */
    protected events: EventManager = new EventManager();

    /**
     * A proxy for this.events.on().
     */
    public on (event: string, handler: Function): void {
        this.events.on(event, handler);
    }

    /**
     * A proxy for this.events.off().
     */
    public off (event?: string, handler?: Function): void {
        this.events.off(event, handler);
    }
}