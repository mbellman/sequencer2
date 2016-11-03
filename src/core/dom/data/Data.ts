import HashTable from "core/system/structures/HashTable";
import EventStore from "core/dom/data/EventStore";
import ActionStore from "core/dom/data/ActionStore";

import { hasOwn, each } from "core/system/Utilities";
import { Hash } from "core/system/structures/Types";

/**
 * The property to apply to each Element to which its unique identifier is assigned.
 */
const DATA_ID: string = 'data';

/**
 * Data pertaining to individual Elements.
 */
class ElementData {
    /* A DOMEventHandler store for the Element. */
    public events: EventStore = new EventStore();

    /* A DOMActionHandler store for the Element. */
    public actions: ActionStore = new ActionStore();
}

/**
 * An API for managing ElementData on individual Elements.
 */
export default class Data {
    /* The internal store for element data. */
    private static data: HashTable<ElementData> = new HashTable<ElementData>();

    /**
     * Creates a new data entry for an element using a unique pseudo-random identifier.
     */
    public static register (element: Element): void {
        if (hasOwn(element, DATA_ID)) {
            return;
        }

        var id: string = this.generateElementId();
        element[DATA_ID] = id;

        this.data.store(id, new ElementData());
    }

    /**
     * Returns the unique identifier bound to a particular element.
     */
    public static getId (element: Element): string {
        return element[DATA_ID];
    }

    /**
     * Returns the data bound to a particular element.
     */
    public static getData (element: Element): ElementData {
        var id: string = this.getId(element);

        return this.data.retrieve(id);
    }

    /**
     * Returns a pseudo-random, unique identifier string.
     */
    private static generateElementId(): string {
        return String(Date.now() + '' + Math.random());
    }
}