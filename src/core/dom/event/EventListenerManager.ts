import Data from "core/dom/data/Data";

import { each } from "core/system/Utilities";
import { Hash } from "core/system/structures/Types";
import { DOMListenerTable, DOMListenerManager } from "core/dom/DOM";

/**
 * An event listener function bound only once per Element per event type. The
 * {type} property of the recorded event will be used to trigger all stored
 * EventHandlers for that event type in the Element's EventStore data.
 */
function globalListener (e: Event): void {
    Data.getData(<Element>e.currentTarget).events.fire(e.type, e);
}

/**
 * An API for managing event listeners on Elements.
 * 
 * This API is leveraged by Query, and should not be used manually.
 */
export default class EventListenerManager implements DOMListenerManager {
    /* A Hash of DOMListenerTables for each Element, where each key is the Element's unique data ID. */
    private listeners: Hash<DOMListenerTable> = {};

    /**
     * Determines whether an event listener for a specific event has been bound on an Element.
     */
    public isListening (element: Element, event?: string): boolean {
        var listeners: DOMListenerTable = this.getElementListenerTable(element);

        if (!event) {
            return !!listeners;
        }

        return (listeners ? !!listeners[event] : false);
    }

    /**
     * Binds a listener to an Element for a specific event.
     * @implements (DOMListenerManager)
     */
    public add (element: Element, event: string): void {
        var id: string = Data.getId(element);

        if (!this.isListening(element)) {
            this.listeners[id] = {};
        }

        this.listeners[id][event] = true;

        element.addEventListener(event, globalListener);
    }

    /**
     * Removes one or all event listeners on an Element.
     * @implements (DOMListenerManager)
     */
    public remove (element: Element, event?: string): void {
        if (!event) {
            this.removeAll(element);
        } else {
            this.removeOne(element, event);
        }
    }

    /**
     * Returns the internal DOMListenerTable for a specific Element.
     */
    private getElementListenerTable (element: Element): DOMListenerTable {
        var id: string = Data.getId(element);

        return this.listeners[id];
    }

    /**
     * Removes all event listeners from an Element and deletes its store in {listeners}.
     */
    private removeAll (element: Element): void {
        var id: string = Data.getId(element);
        var listeners: DOMListenerTable = this.listeners[id];

        each(listeners, (isBound: boolean, event: string) => {
            element.removeEventListener(event, globalListener);
        });

        delete this.listeners[id];
    }

    /**
     * Removes an event-specific listener from an Element and deletes the 
     * event from its store in {listeners}.
     */
    private removeOne (element: Element, event: string): void {
        var listeners: DOMListenerTable = this.getElementListenerTable(element);

        element.removeEventListener(event, globalListener);

        if (listeners) {
            delete listeners[event];
        }
    }
}