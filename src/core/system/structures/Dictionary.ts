import { Hash } from "core/system/structures/Types";

/**
 * An associative map from arbitrary objects to custom values.
 */
export default class Dictionary<U, T> {
    /* The internal Hash store for the items in the Dictionary. */
    private dictionary: Hash<T> = {};

    /**
     * Adds an item to the Dictionary.
     */
    public add (key: U, value: T): void {
        var keyString: string = JSON.stringify(key);

        this.dictionary[keyString] = value;
    }

    /**
     * Removes an item from the Dictionary.
     */
    public remove (key: U): void {
        delete this.dictionary[JSON.stringify(key)];
    }

    /**
     * Clears all entries in the Dictionary.
     */
    public clear (): void {
        this.dictionary = {};
    }

    /**
     * Determines whether the Dictionary contains an entry for a specific object of type <U>.
     */
    public contains (key: U): boolean {
        return !!this.dictionary[JSON.stringify(key)];
    }

    /**
     * Retrieves the Dictionary definition associated with a specific object of type <U>.
     */
    public search (key: U): T {
        return this.dictionary[JSON.stringify(key)];
    }
}