import Time from "core/system/Time";
import Data from "core/dom/data/Data";
import Dictionary from "core/system/structures/Dictionary";
import ActionStore from "core/dom/data/ActionStore";

import { ActionType, Action } from "core/dom/action/Action";
import { ClickAction, DoubleClickAction, MoveAction, DragAction } from "core/dom/action/MouseActions";
import { $, Query, DOMListenerTable, DOMListenerManager } from "core/dom/DOM";

/**
 * An API for binding "Action" listeners to DOM Elements. Actions are like Events, but can
 * occur over time, and have a richer description than regular Events. Due to the manner
 * in which the event bindings controlling the actual Action bindings can overlap, Actions
 * can be bound individually but only unbound collectively.
 * 
 * This API is leveraged by Query, and should not be used manually.
 */
export default class ActionListenerManager implements DOMListenerManager {
    /* A Dictionary of DOMListenerTables for each Query. */
    private listeners: Dictionary<Query, DOMListenerTable> = new Dictionary<Query, DOMListenerTable>();

    /**
     * Determines whether an action binding for a specific action has been bound on a Query.
     */
    public isListening (query: Query, action: ActionType): boolean {
        return true;
    }

    /**
     * Delegates a particular Action binding on a Query.
     * @implements (DOMListenerManager)
     */
    public add (query: Query, action: ActionType): void {
        switch (action) {
            case ActionType.CLICK:
            case ActionType.DOUBLE_CLICK:
                this.delegateClick(query);
                break;
            case ActionType.RIGHT_CLICK:
                this.delegateRightClick(query);
                break;
            case ActionType.MOVE:
                this.delegateMove(query);
                break;
            case ActionType.DRAG:
                this.delegateDrag(query);
                break;
            default:
                break;
        }
    }

    /**
     * Removes all Action bindings on a Query.
     * @implements (DOMListenerManager)
     */
    public remove (query: Query): void {
        query.off('click.ActionListenerManager')
            .off('contextmenu.ActionListenerManager')
            .off('mousemove.ActionListenerManager')
            .off('mousedown.ActionListenerManager');
    }

    /**
     * Binds a singular click event handler on a Query to manage
     * both single-click and double-click Actions.
     */
    private delegateClick (query: Query): void {
        query.on('click.ActionListenerManager', (e: MouseEvent) => {
            var actions: ActionStore = Data.getData(<Element>e.currentTarget).actions;

            if (actions.lastAction) {
                var delay: number = Time.since(actions.lastAction.timestamp);

                if (actions.lastAction.type === ActionType.CLICK && delay < 250) {
                    var doubleClickAction: DoubleClickAction = new DoubleClickAction(e, delay);

                    actions.fire(ActionType.DOUBLE_CLICK, doubleClickAction);

                    return;
                }
            }

            var click: ClickAction = new ClickAction(e);

            actions.fire(ActionType.CLICK, click);
        });
    }

    /**
     * Binds a 'contextmenu' event handler on a Query to manage right-click Actions.
     */
    private delegateRightClick (query: Query): void {
        query.on('contextmenu.ActionListenerManager', (e: MouseEvent) => {
            var clickAction: ClickAction = new ClickAction(e);
            clickAction.type = ActionType.RIGHT_CLICK;

            Data.getData(<Element>e.currentTarget).actions.fire(ActionType.RIGHT_CLICK, clickAction);
            e.preventDefault();
        });
    }

    /**
     * Binds a 'mousemove' event handler on a Query to manage move Actions.
     */
    private delegateMove (query: Query): void {
        var moveAction: MoveAction;
        var lastMoveTime: number = 0;

        query.on('mousemove.ActionListenerManager', (e: MouseEvent) => {
            if (Time.since(lastMoveTime) > 1000) {
                moveAction = new MoveAction(e);
            } else {
                moveAction.update(e.clientX, e.clientY);
            }

            lastMoveTime = Date.now();

            Data.getData(<Element>e.currentTarget).actions.fire(ActionType.MOVE, moveAction);
        });
    }

    /**
     * Binds a 'mousedown' event handler on a Query which uses additional body
     * event handlers to monitor and manage drag Actions.
     */
    private delegateDrag (query: Query): void {
        query.on('mousedown.ActionListenerManager', (e: MouseEvent) => {
            var actions: ActionStore = Data.getData(<Element>e.currentTarget).actions;
            var dragAction: DragAction = new DragAction(e);

            $('body').on('mousemove.ActionListenerManager', (e: MouseEvent) => {
                dragAction.update(e.clientX, e.clientY);
                actions.fire(ActionType.DRAG, dragAction);
            });

            $('body').on('mouseup.ActionListenerManager', function (e: MouseEvent) {
                dragAction.ended = true;

                actions.fire(ActionType.DRAG, dragAction);
                $(this).off('mousemove.ActionListenerManager mouseup.ActionListenerManager');
            });
        });
    }
}