import Data from "core/dom/Data";
import { each } from "core/system/Utilities";
import { Hash } from "core/system/Types";

/**
 * @ private function listener
 * 
 * A single-use event listener used to dispatch all event handlers stored for an Element in its ElementData.
 */
function listener (e: Event): void {
    Data.triggerEvent(<Element>e.target, e.type, e);
}

/**
 * @ public class Listener
 * 
 * Provides an API for binding the internal listener() function to Elements for specific events.
 */
export default class Listener {
    private static events: Hash<Hash<boolean>> = {};    // A store of tables for each Element representing its currently monitored events.

    /**
     * Binds a listener to an Element for a specific event.
     */
    public static add (element: Element, event: string): void {
        var id: string = Data.getId(element);

        if (!this.monitoring(element)) {
            this.events[id] = {};
        }

        var events: Hash<boolean> = this.events[id];
        events[event] = true;

        element.addEventListener(event, listener);
    }

    /**
     * Unbinds specific or all event listeners on an Element.
     */
    public static remove (element: Element, event: string = null): void {
        var id: string = Data.getId(element);

        if (!event) {
            // Remove all listeners
            var events: Hash<boolean> = this.events[id];

            each(events, (event: string): void => {
                element.removeEventListener(event, listener);
            });

            this.removeAll(id);
        } else {
            // Remove a specific event listener
            element.removeEventListener(event, listener);
            this.removeOne(id, event);
        }
    }

    /**
     * Determines whether any event or a specific event is being monitored on an Element.
     */
    public static monitoring (element: Element, event: string = null): boolean {
        var id: string = Data.getId(element);
        var events: Hash<boolean> = this.events[id];

        if (!event) {
            return !!events;
        }

        return !!(events && events[event]);
    }

    /**
     * Deletes the table of monitored Element events for a specific Element ID.
     */
    private static removeAll (id: string): void {
        delete this.events[id];
    }

    /**
     * Deletes a specific monitored event from an Element's events table.
     */
    private static removeOne (id: string, event: string): void {
        delete this.events[id][event];
    }
}