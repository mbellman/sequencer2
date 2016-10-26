import HashTable from "core/system/HashTable";
import EventStore from "core/dom/data/EventStore";
import ActionStore from "core/dom/data/ActionStore";

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
 * A collection of data pertaining to individual DOM Elements.
 */
class ElementData {
    /* @ An event handler store for the Element. */
    public events: EventStore = new EventStore();
    /* @ An action handler store for the Element. */
    public actions: ActionStore = new ActionStore();
}

/**
 * @ public class Data
 * 
 * Provides an internal store and accompanying methods for managing data pertaining to individual DOM Elements.
 */
export default class Data {
    /* @ The internal store for DOM Element data. */
    private static data: HashTable<ElementData> = new HashTable<ElementData>();

    /**
     * Creates a new data entry for a DOM Element using a unique pseudo-random identifier.
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
}