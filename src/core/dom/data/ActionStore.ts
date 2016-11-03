import { each } from "core/system/Utilities";
import { Hash } from "core/system/structures/Types";
import { DOMActionHandler, DOMHandlerQueue, DOMHandlerStore } from "core/dom/DOM";
import { ActionType, Action } from "core/dom/action/Action";

/**
 * An action handler store and manager for individual document Elements.
 */
export default class ActionStore implements DOMHandlerStore {
    /* A reference to the last Action triggered on the Element. */
    public lastAction: Action;

    /* A list of DOMActionHandlers for each Action type bound on the Element. */
    private actions: Hash<DOMHandlerQueue> = {};

    /**
     * Adds a new DOMActionHandler to the DOMHandlerQueue for a particular action.
     * @implements (DOMHandlerStore)
     */
    public bind (action: ActionType, handler: DOMActionHandler): void {
        if (!this.actions[action]) {
            this.actions[action] = [];
        }

        this.actions[action].push(handler);
    }

    /**
     * Removes all DOMActionHandlers.
     * @implements (DOMHandlerStore)
     */
    public unbind (): void {
        this.actions = {};
    }

    /**
     * Dispatches each DOMActionHandler method for a particular action, passing an Action instance
     * into each handler. Loops backward so that later-bound handlers can return false, stopping
     * the DOMActionHandler dispatch sequence.
     * @implements (DOMHandlerStore)
     */
    public fire (action: ActionType, a: Action): void {
        this.lastAction = a;

        var handlers: DOMHandlerQueue = this.actions[action] || [];

        for (let i = handlers.length - 1 ; i >= 0 ; --i) {
            let handler: DOMActionHandler = <DOMActionHandler>handlers[i];

            if (handler(a) === false) {
                break;
            }
        }
    }
}