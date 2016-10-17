import HashTable from "core/system/HashTable";
import Listener from "core/dom/Listener";
import { hasOwn, each } from "core/system/Utilities";
import { Hash, EventHandler, HandlerQueue } from "core/system/Types";

/**
 * @ private const DATA_ID
 * 
 * The property to apply to each Element to which its unique identifier is assigned.
 */
const DATA_ID: string = 'data';

/**
 * @ private class ElementData
 * 
 * A collection of data pertaining to an individual DOM Element.
 */
class ElementData {
    public events: Hash<HandlerQueue> = {};    // An event handler store for the Element.
}

/**
 * @ public class Data
 * 
 * Provides an internal store and accompanying methods for managing data pertaining to individual DOM Elements.
 */
export default class Data {
    private static data: HashTable<ElementData> = new HashTable<ElementData>();    // The internal store for DOM Element data.

    /**
     * Returns the unique identifier bound to a particular Element.
     */
    public static getId (element: Element): string {
        return element[DATA_ID];
    }

    /**
     * Returns the data bound to a particular Element.
     */
    public static getData (element: Element): ElementData {
        var id: string = this.getId(element);

        return this.data.retrieve(id);
    }

    /**
     * Creates a new internal store entry for a DOM Element via a unique pseudo-random identifier.
     */
    public static register (element: Element): void {
        if (hasOwn(element, DATA_ID)) {
            return;
        }

        var id: string = String(Date.now() + Math.random());
        element[DATA_ID] = id;

        this.data.store(id, new ElementData());
    }

    /**
     * Adds a new event handler to an Element's event data HandlerQueue.
     */
    public static addEventHandler (element: Element, event: string, handler: EventHandler): void {
        var events: Hash<HandlerQueue> = this.getData(element).events;

        if (!Listener.monitoring(element, event)) {
            Listener.add(element, event);
        }

        if (!hasOwn(events, event)) {
            events[event] = [];
        }

        events[event].push(handler);
    }

    /**
     * Removes one or all event handlers from an Element's event data HandlerQueue for one or all event types.
     */
    public static removeEventHandler (element: Element, event: string = null, handler: EventHandler = null) {
        // TODO
    }

    /**
     * Dispatches all event handlers registered to an Element's event data HandlerQueue for a particular event type.
     */
    public static triggerEvent (element: Element, event: string, e: Event) {
        var handlers: HandlerQueue = this.getData(element).events[event];

        each(handlers, (handler: EventHandler): void => {
            handler(e);
        });
    }
}