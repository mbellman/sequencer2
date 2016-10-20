import Data from "core/dom/data/Data";

import { each } from "core/system/Utilities";
import { Hash, EventHandler } from "core/system/Types";

/**
 * @ private type ActiveEvents
 * 
 * A type signature for a list of event names (keys) and true boolean
 * values indicating that a listener is bound on the event.
 */
type ListenerTable = Hash<boolean>;

/**
 * @ private function globalListener
 * 
 * An event listener function bound only once per Element per event type. The
 * {type} property of the recorded event will be used to trigger all stored
 * EventHandlers for that event type in the Element's EventStore data.
 */
function globalListener (e: Event): void {
    Data.getData(<Element>e.currentTarget).events.trigger(e.type, e);
}

/**
 * @ public class EventListener
 * 
 * Provides an API for binding EventHandler listener methods to Elements for specific events.
 */
export default class EventListener {
    // A store of ListenerTables for each Element representing its currently bound events.
    private static listeners: Hash<ListenerTable> = {};

    /**
     * Binds a listener to an Element for a specific event.
     */
    public static add (element: Element, event: string): void {
        var id: string = Data.getId(element);

        if (!this.listening(element)) {
            this.listeners[id] = {};
        }

        this.listeners[id][event] = true;

        element.addEventListener(event, globalListener);
    }

    /**
     * Removes one or all event listeners on an Element.
     */
    public static remove (element: Element, event: string = null): void {
        if (!event) {
            this.removeAll(element);
        } else {
            this.removeOne(element, event);
        }
    }

    /**
     * Determines whether any event or a specific event is being monitored on an Element.
     */
    public static listening (element: Element, event: string = null): boolean {
        var id: string = Data.getId(element);
        var listeners: ListenerTable = this.listeners[id];

        if (!event) {
            return !!listeners;
        }

        return (listeners ? !!listeners[event] : false);
    }

    /**
     * Removes all event listeners from an Element and deletes its store in {activeEvents}.
     */
    private static removeAll (element: Element): void {
        var id: string = Data.getId(element);
        var listeners: ListenerTable = this.listeners[id];

        each(listeners, (event: string) => {
            element.removeEventListener(event, globalListener);
        });

        delete this.listeners[id];
    }

    /**
     * Removes an event-specific listener from an Element and deletes the 
     * event from its store in {listeners}.
     */
    private static removeOne (element: Element, event: string): void {
        var id: string = Data.getId(element);

        element.removeEventListener(event, globalListener);

        delete this.listeners[id][event];
    }
}