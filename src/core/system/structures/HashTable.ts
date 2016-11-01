import { isUndefined, each } from "core/system/Utilities";
import { Hash, IterationHandler } from "core/system/structures/Types";

/**
 * A store containing values associated to specific keys, along
 * with several convenient methods for data management.
 */
export default class HashTable<T> {
    /* An internal Hash for the HashTable data. */
    private table: Hash<T> = {};

    /* The number of items in the Hash Table. */
    private items: number = 0;

    /* The last key looked up from the Hash Table. */
    private lastKey: string;

    /* The last value retrieved from the Hash Table. */
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
    public each (handler: IterationHandler): any {
        return each(this.table, handler);
    }

    /**
     * Constructs a new HashTable from stored keys specified by name.
     */
    public pick (...keys: Array<string>): HashTable<T> {
        var picked: HashTable<T> = new HashTable<T>();

        each(keys, (key: string) => {
            if (this.has(key)) {
                picked.store(key, this.table[key]);
            }
        });

        return picked;
    }
}