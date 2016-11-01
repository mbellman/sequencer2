import { each } from "core/system/Utilities";
import { EventDelegator } from "core/system/Event";
import { Hash } from "core/system/structures/Types";
import { DOMActionHandler, DOMHandlerQueue } from "core/dom/Types";
import { ActionType, Action } from "core/dom/action/Action";

/**
 * An action handler store and manager for individual document Elements.
 */
export default class ActionStore implements EventDelegator {
    /* A reference to the last Action triggered on the Element. */
    public last: Action;

    /* A list of DOMActionHandlers for each Action type bound on the Element. */
    private actions: Hash<DOMHandlerQueue> = {};

    /**
     * Adds a new DOMActionHandler to the DOMHandlerQueue for a particular action.
     */
    public on (action: ActionType, handler: DOMActionHandler): void {
        if (!this.actions[action]) {
            this.actions[action] = [];
        }

        this.actions[action].push(handler);
    }

    /**
     * Dereferences all queued DOMActionHandlers for the Element, effectively clearing its action bindings.
     */
    public off (): void {
        each(this.actions, (handlers: DOMHandlerQueue, action: string) => {
            delete this.actions[action];
        });
    }

    /**
     * Dispatches each DOMActionHandler method for a particular action, working backward so that
     * later-bound handlers can return false, stopping the DOMActionHandler dispatch sequence.
     */
    public trigger (action: ActionType, a: Action): void {
        this.last = a;

        var handlers: DOMHandlerQueue = this.actions[action] || [];

        for (let i = handlers.length - 1 ; i >= 0 ; --i) {
            let handler: DOMActionHandler = <DOMActionHandler>handlers[i];

            if (handler(a) === false) {
                break;
            }
        }
    }
}