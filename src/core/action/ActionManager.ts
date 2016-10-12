import Action from "core/action/Action";
import * as u from "core/system/Utilities";
import { ClickAction, MoveAction, DragAction } from "core/action/MouseActions";
import { ActionT, CLICK_ACTION, MOVE_ACTION, DRAG_ACTION } from "core/Constants";

/**
 * @ private interface ActionHandler
 * 
 * Provides a type guard for action handler functions.
 */
interface ActionHandler {
    (action: Action): void;
}

/**
 * @ private class HandlerQueue
 *
 * An internal action handler delegation/dispatch queue.
 */
class HandlerQueue {
    private click: Array<ActionHandler> = [];
    private move: Array<ActionHandler> = [];
    private drag: Array<ActionHandler> = [];

    public save (action: ActionT, handler: ActionHandler): void {
       this[action].push(handler);
    }

    public fire (action: ActionT, actionInstance: Action): void {
        this[action].forEach((handler: ActionHandler) => {
            handler(actionInstance);
        });
    }
}

/**
 * @ public class ActionManager
 * 
 * An action listener/handler delegation manager.
 */
export default class ActionManager {
    private handlers: HandlerQueue = new HandlerQueue();
    private activeMove: Action;
    private activeDrag: Action;

    private createAction (action: ActionT, data: /* TODO: abstract DOMEvent */ Event): Action | null {
        let target = data.currentTarget;

        switch (action) {
            case CLICK_ACTION:
                return new ClickAction(target, data.clientX, data.clientY);
            case MOVE_ACTION:
                return u.isUndefined(this.activeMove) ? new MoveAction() : this.activeMove;
            case DRAG_ACTION:
                return u.isUndefined(this.activeDrag) ? new DragAction() : this.activeDrag;
            default:
                return null;
        }
    }

    public on (action: ActionT, handler: ActionHandler): void {
        this.handlers.save(action, handler);
    }

    public trigger (action: ActionT, data: Event): void {
        let instance: Action = this.createAction(action, data);

        this.handlers.fire(action, instance);
    }

    public release (action: ActionT) {
        if (action === MOVE_ACTION) {
            this.activeMove = undefined;
        } else if (action === DRAG_ACTION) {
            this.activeDrag = undefined;
        }
    }
}