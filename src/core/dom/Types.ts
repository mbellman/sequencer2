import { Action } from "core/dom/action/Action";

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
 * An Array of EventHandlers or ActionHandlers.
 */
export type HandlerQueue = Array<EventHandler | ActionHandler>;