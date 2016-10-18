/**
 * @ public interface Hash<T>
 * 
 * A generic key/value pair list type signature.
 */
export interface Hash<T> {
    [key: string]: T;
}

/**
 * @ public type Table<T>
 * 
 * A type signature for generic key/value lists containing enumerable properties.
 */
export type Table<T> = Hash<T> | Object;

/**
 * @ public type Collection<T>
 * 
 * A type signature for either key/value lists or native Arrays.
 */
export type Collection<T> = Table<T> | Array<T>;

/**
 * @ public interface IterationHandler
 * 
 * A type signature for functions which iterate over a native Array or key/value list.
 */
export interface IterationHandler {
    (value: any, key: string | number): any;
}

/**
 * @ public interface EventHandler
 * 
 * A type signature for element event handler methods.
 */
export interface EventHandler {
    (e: Event): void;
}

/**
 * @ public type HandlerQueue
 * 
 * A type signature for an Array of EventHandlers.
 */
export type HandlerQueue = Array<EventHandler>;