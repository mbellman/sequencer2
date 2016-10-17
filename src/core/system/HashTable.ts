import { Hash, Iterator } from "core/system/Types";
import { isUndefined, each } from "core/system/Utilities";

/**
 * @ public class HashTable
 * 
 * An associative map of keys to values.
 */
export default class HashTable<T> {
    private table: Hash<T> = {};          // An internal Object for the Hash Table data.
    private items: number = 0;            // The number of items in the Hash Table.
    private lastKey: string;              // The last key looked up from the Hash Table.
    private lastValue: T;                 // The last value retrieved from the Hash Table.

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

        if (!isUndefined(value)) {
            this.lastKey = key;
            this.lastValue = value;
        }

        return value;
    }

    /**
     * Determines whether the internal table contains a key value.
     */
    public has (key: string): boolean {
        return !isUndefined(this.retrieve(key));
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
    public each (handler: Iterator): any {
        return each(this.table, handler);
    }

    /**
     * Constructs a new HashTable from stored keys specified by name.
     */
    public pick (...keys: Array<string>): HashTable<T> {
        var picked: HashTable<T> = new HashTable<T>();

        each(keys, (key: string): void => {
            if (this.has(key)) {
                picked.store(key, this.table[key]);
            }
        });

        return picked;
    }
}