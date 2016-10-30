import { each } from "core/system/Utilities";
import { Hash } from "core/system/Types";
import { ActionType, Action } from "core/dom/action/Action";
import { ActionHandler, HandlerQueue } from "core/dom/Types";

/**
 * @ public class ActionStore
 * 
 * An action handler store and manager for individual Elements.
 */
export default class ActionStore {
    /* @ A reference to the last Action triggered on the Element. */
    public last: Action;
    /* @ A list of ActionHandlers for each Action type bound on the Element. */
    private actions: Hash<HandlerQueue> = {};

    /**
     * Adds a new ActionHandler to the HandlerQueue for a particular action.
     */
    public bind (action: ActionType, handler: ActionHandler): void {
        if (!this.actions[action]) {
            this.actions[action] = [];
        }

        this.actions[action].push(handler);
    }

    /**
     * Dereferences all queued ActionHandlers for the Element, effectively clearing its action bindings.
     */
    public release (): void {
        each(this.actions, (handlers: HandlerQueue, action: string) => {
            delete this.actions[action];
        });
    }

    /**
     * Dispatches each ActionHandler method for a particular action, working backward so that
     * later-bound handlers can return false, stopping the ActionHandler dispatch sequence.
     */
    public trigger (action: ActionType, a: Action): void {
        this.last = a;

        var handlers: HandlerQueue = this.actions[action] || [];

        for (let i = handlers.length - 1 ; i >= 0 ; --i) {
            let handler: ActionHandler = <ActionHandler>handlers[i];

            if (handler(a) === false) {
                break;
            }
        }
    }
}