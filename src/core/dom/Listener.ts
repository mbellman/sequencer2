import Data from "core/dom/data/Data";
import { each } from "core/system/Utilities";
import { Hash } from "core/system/Types";

/**
 * @ private function listener
 * 
 * A single-use event listener used to dispatch all event handlers stored for an Element in its ElementData.
 */
function listener (e: Event): void {
    Data.getData(<Element>e.currentTarget).events.trigger(e.type, e);
}

/**
 * @ public class Listener
 * 
 * Provides an API for binding the internal listener() function to Elements for specific events.
 */
export default class Listener {
    private static listeners: Hash<Hash<boolean>> = {};    // A store of tables for each Element representing its currently monitored events.

    /**
     * Binds a listener to an Element for a specific event.
     */
    public static add (element: Element, event: string): void {
        var id: string = Data.getId(element);

        if (!this.monitoring(element)) {
            this.listeners[id] = {};
        }

        var events: Hash<boolean> = this.listeners[id];
        events[event] = true;

        element.addEventListener(event, listener);
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
    public static monitoring (element: Element, event: string = null): boolean {
        var id: string = Data.getId(element);
        var events: Hash<boolean> = this.listeners[id];

        if (!event) {
            return !!events;
        }

        return (events ? !!events[event] : false);
    }

    /**
     * Removes all event listeners from an Element and deletes its store in {listeners}.
     */
    private static removeAll (element: Element): void {
        var id: string = Data.getId(element);
        var events: Hash<boolean> = this.listeners[id];

        each(events, (event: string) => {
            element.removeEventListener(event, listener);
        });

        delete this.listeners[id];
    }

    /**
     * Removes an event-specific listener from an Element and
     * deletes the event from its store in {listeners}.
     */
    private static removeOne (element: Element, event: string): void {
        var id: string = Data.getId(element);

        element.removeEventListener(event, listener);

        delete this.listeners[id][event];
    }
}