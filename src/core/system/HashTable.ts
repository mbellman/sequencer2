import * as Types from "core/system/Types";
import * as u from "core/system/Utilities";

/**
 * @ public class HashTable
 * 
 * An associative map of keys to values.
 */
export default class HashTable<T> {
    private table: Types.Hash<T> = {};
    private items: number = 0;

    /**
     * Last-lookup cache
     */
    private lastKey: string;
    private lastValue: T;

    /**
     * Saves a value to the internal table.
     */
    public store (key: string, value: T): void {
        this.table[key] = value;
        this.items++;
    }

    /**
     * Retrieves a value from the internal table by key name.
     */
    public retrieve (key: string): T {
        if (key === this.lastKey) {
            return this.lastValue;
        }

        var value: T = this.table[key];

        if (!u.isUndefined(value)) {
            this.lastKey = key;
            this.lastValue = value;
        }

        return value;
    }

    /**
     * Determines whether the internal table contains a key value.
     */
    public has (key: string): boolean {
        return !u.isUndefined(this.retrieve(key));
    }

    /**
     * Returns the number of elements in the internal table.
     */
    public size (): number {
        return this.items;
    }

    /**
     * Removes a value from the internal table.
     */
    public delete (key: string): void {
        delete this.table[key];
        this.items--;
    }

    /**
     * Iterates over the internal table, invoking a handler for each item.
     */
    public each (handler: Types.Iterator<T>): any {
        return u.each(this.table, handler);
    }

    /**
     * Constructs a new HashTable from stored keys specified by name.
     */
    public pick (...keys: Array<String>): HashTable<T> {
        var picked: HashTable<T> = new HashTable<T>();

        for (let key in keys) {
            if (this.has(key)) {
                picked.store(key, this.table[key]);
            }
        }

        return picked;
    }
}