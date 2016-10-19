import Data from "core/dom/data/Data";

import { parseEventName } from "core/dom/Event";
import { each } from "core/system/Utilities";
import { Hash, EventHandler, ParsedEvent } from "core/system/Types";

/**
 * @ private type MonitoredEvents
 * 
 * A type signature for a list of event names (keys) and true
 * boolean values representing their status as monitored.
 */
type MonitoredEvents = Hash<boolean>;

/**
 * @ public class Listener
 * 
 * Provides an API for binding EventHandler listener methods to Elements for specific events.
 */
export default class Listener {
    // A store of tables for each Element representing its currently monitored events.
    private static elementEvents: Hash<MonitoredEvents> = {};

    /**
     * A list of namespaced EventHandlers, starting with a default handler for non-namespaced events.
     * When namespaced events are bound on Elements via Listener.add(), a namespaced handler will be
     * automatically created (if it does not exist) as a handler.default() wrapper method and added
     * to the list as a property with its namespace as the property key. The namespaced EventHandler
     * can then be bound on/removed from Elements when events with that namespace are delegated.
     */
    private static handler: any = {
        default: (e: Event, namespace: string = null): void => {
            Data.getData(<Element>e.currentTarget).events.trigger(e.type, e, namespace);
        }
    };

    /**
     * Binds a listener to an Element for a specific event.
     */
    public static add (element: Element, event: string): void {
        var id: string = Data.getId(element);

        if (!this.monitoring(element)) {
            this.elementEvents[id] = {};
        }

        var monitors: MonitoredEvents = this.elementEvents[id];
        var bindings: any = this.getBindingArgs(event);
        monitors[event] = true;

        element.addEventListener(bindings.event, bindings.handler);
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
        var monitors: MonitoredEvents = this.elementEvents[id];

        if (!event) {
            return !!monitors;
        }

        return (monitors ? !!monitors[event] : false);
    }

    /**
     * Removes all event listeners from an Element and deletes its store in {listeners}.
     */
    private static removeAll (element: Element): void {
        var id: string = Data.getId(element);
        var monitors: MonitoredEvents = this.elementEvents[id];

        each(monitors, (event: string) => {
            let bindings: any = this.getBindingArgs(event);

            element.removeEventListener(bindings.event, bindings.handler);
        });

        delete this.elementEvents[id];
    }

    /**
     * Removes an event-specific listener from an Element and deletes the 
     * event from its store in {listeners}.
     */
    private static removeOne (element: Element, event: string): void {
        var id: string = Data.getId(element);
        var bindings: any = this.getBindingArgs(event);

        element.removeEventListener(bindings.event, bindings.handler);

        delete this.elementEvents[id][event];
    }

    /**
     * Takes an event name string (which may or may not be namespaced) and returns an object
     * containing the base event type name and the internal EventHandler listener associated
     * with the namespace, both of which can be passed to addEventListener/removeEventListener.
     */
    private static getBindingArgs (event: string): any {
        var parsed: ParsedEvent = parseEventName(event);
        var handler: EventHandler = this.handler[parsed.namespace || 'default'];

        if (!handler) {
            handler = this.createHandler(parsed.namespace);
        }

        return {
            event: parsed.event,
            handler: handler
        };
    }

    /**
     * Creates a namespaced EventHandler wrapper for handler.default() in the
     * internal {handler} list and returns the reference.
     */
    private static createHandler (namespace: string = null): EventHandler {
        return this.handler[namespace] = (e: Event) => {
            this.handler.default(e, namespace);
        };
    }
}