/**
 * @ public interface Hash<T>
 * 
 * A generic key/value pair list.
 */
export interface Hash<T> {
    [key: string]: T;
}

/**
 * @ public type Collection<T>
 * 
 * An ordered or unordered list of items.
 */
export type Collection<T> = Hash<T> | Array<T>;

/**
 * @ public type IterationHandler
 * 
 * A function which iterates over a native Array or key/value list.
 */
export type IterationHandler = (value: any, key: string | number) => any;