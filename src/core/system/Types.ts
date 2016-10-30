/**
 * @ public interface Hash<T>
 * 
 * A generic key/value pair list.
 */
export interface Hash<T> {
    [key: string]: T;
}

/**
 * @ public type Table<T>
 * 
 * A generic key/value list containing enumerable properties.
 */
export type Table<T> = Hash<T> | Object;

/**
 * @ public type Collection<T>
 * 
 * Either a key/value list or a native Array.
 */
export type Collection<T> = Table<T> | Array<T>;

/**
 * @ public type IterationHandler
 * 
 * A function which iterates over a native Array or key/value list.
 */
export type IterationHandler = (value: any, key: string | number) => any;