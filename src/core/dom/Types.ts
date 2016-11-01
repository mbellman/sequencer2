import { Action } from "core/dom/action/Action";

/**
 * A DOM event handler method fired by an event trigger.
 */
export type DOMEventHandler = (e: Event) => any;

/**
 * A handler method to be run on Action triggers (analagous
 * to DOMEventHandler methods on Events).
 */
export type DOMActionHandler = (action: Action) => any;

/**
 * An Array of EventHandlers or ActionHandlers.
 */
export type DOMHandlerQueue = Array<DOMEventHandler | DOMActionHandler>;