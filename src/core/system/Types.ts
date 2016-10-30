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
 * @ public type IterationHandler
 * 
 * A function which iterates over a native Array or key/value list.
 */
export type IterationHandler = (value: any, key: string | number) => any;

/**
 * @ public type EventHandler
 * 
 * A DOM event handler method.
 */
export type EventHandler = (e: Event) => any;

/**
 * @ public type ActionHandler
 * 
 * A handler method to be run on Action triggers (analagous
 * to EventHandler methods on Events).
 */
export type ActionHandler = (action: Action) => any;

/**
 * @ public type HandlerQueue
 * 
 * An Array of EventHandlers.
 */
export type HandlerQueue = Array<EventHandler | ActionHandler>;