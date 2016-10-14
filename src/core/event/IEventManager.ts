import * as Types from "core/system/Types";

/**
 * @ public interface EventManager
 * 
 * Shapes a generic API for delegating and triggering event handlers.
 */
export interface IEventManager {
    /**
     * Delegates an event handler to be fired on an event trigger.
     */
    on: (event: string, handler: Types.EventHandler, ...args: Array<any>) => void;

    /**
     * Fires all event handlers delegated for a specific event.
     */
    trigger: (event: string, ...args: Array<any>) => void;
}