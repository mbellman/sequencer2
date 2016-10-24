import { Action } from "core/action/Action";

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
 * @ public interface IterationHandler
 * 
 * A function which iterates over a native Array or key/value list.
 */
export interface IterationHandler {
    (value: any, key: string | number): any;
}

/**
 * @ public interface EventHandler
 * 
 * An Element event handler method.
 */
export interface EventHandler {
    (e: Event): void;
}

/**
 * @ public type HandlerQueue
 * 
 * An Array of EventHandlers.
 */
export type HandlerQueue = Array<EventHandler>;

/**
 * @ public interface ActionHandler
 * 
 * A handler method to be run on Action triggers (analagous to EventHandler methods on Events).
 */
export interface ActionHandler {
    (action: Action): void;
}