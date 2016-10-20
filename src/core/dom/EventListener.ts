import Data from "core/dom/data/Data";

import { each } from "core/system/Utilities";
import { Hash, EventHandler, ParsedEvent } from "core/system/Types";

/**
 * @ private type ActiveEventTable
 * 
 * A type signature for a list of event names (keys) and true boolean
 * values indicating that a listener is bound on the event.
 */
type ActiveEventTable = Hash<boolean>;

/**
 * @ public class EventListener
 * 
 * Provides an API for binding EventHandler listener methods to Elements for specific events.
 */
export default class EventListener {
    // A store of ActiveEventTables for each Element representing its currently bound events.
    private static activeEvents: Hash<ActiveEventTable> = {};

    // A list of namespaced EventHandlers, starting with a default handler for non-namespaced events.
    // When namespaced events are bound on Elements via Listener.add(), a namespaced handler will be
    // automatically created (if it does not exist) as a handler.default() wrapper method and added
    // to the list as a property with its namespace as the property key. The namespaced EventHandler
    // can then be bound on/removed from Elements when events with that namespace are delegated.
    private static handlers: any = {
        default: (e: Event, namespace: string = 'default'): void => {
            Data.getData(<Element>e.currentTarget).events.trigger(e.type, namespace, e);
        }
    };

    /**
     * Binds a listener to an Element for a specific event.
     */
    public static add (element: Element, event: string): void {
        var id: string = Data.getId(element);

        if (!this.listening(element)) {
            this.activeEvents[id] = {};
        }

        var elementEvents: ActiveEventTable = this.activeEvents[id];
        var { eventName, eventHandler } = this.getListenerBindings(event);
        elementEvents[event] = true;

        element.addEventListener(eventName, eventHandler);
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
        var elementEvents: ActiveEventTable = this.activeEvents[id];

        if (!event) {
            return !!elementEvents;
        }

        return (elementEvents ? !!elementEvents[event] : false);
    }

    /**
     * Removes all event listeners from an Element and deletes its store in {activeEvents}.
     */
    private static removeAll (element: Element): void {
        var id: string = Data.getId(element);
        var elementEvents: ActiveEventTable = this.activeEvents[id];

        each(elementEvents, (event: string) => {
            let { eventName, eventHandler } = this.getListenerBindings(event);

            element.removeEventListener(eventName, eventHandler);
        });

        delete this.activeEvents[id];
    }

    /**
     * Removes an event-specific listener from an Element and deletes the 
     * event from its store in {listeners}.
     */
    private static removeOne (element: Element, event: string): void {
        var id: string = Data.getId(element);
        var { eventName, eventHandler } = this.getListenerBindings(event);

        element.removeEventListener(eventName, eventHandler);

        delete this.activeEvents[id][event];
    }

    /**
     * Takes an event name string (which may or may not be namespaced) and returns an object
     * containing the base event type name and the internal EventHandler listener associated
     * with the namespace, both of which can be passed to addEventListener/removeEventListener.
     */
    private static getListenerBindings (event: string): any {
        var [ event, namespace ] = event.split('.');
        var handler: EventHandler = this.handlers[namespace || 'default'];

        if (!handler) {
            handler = this.createNamespacedHandler(namespace);
        }

        return {
            eventName: event,
            eventHandler: handler
        };
    }

    /**
     * Creates a namespaced EventHandler wrapper for handler.default() in the
     * internal {handlers} list and returns the reference.
     */
    private static createNamespacedHandler (namespace: string = null): EventHandler {
        return this.handlers[namespace] = (e: Event) => {
            this.handlers.default(e, namespace);
        };
    }
}