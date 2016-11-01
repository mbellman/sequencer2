import Time from "core/system/Time";
import Data from "core/dom/data/Data";
import ActionStore from "core/dom/data/ActionStore";

import { ActionType, Action } from "core/dom/action/Action";
import { ClickAction, DoubleClickAction, MoveAction, DragAction } from "core/dom/action/MouseActions";
import { $, Query } from "core/dom/query/Query";

/**
 * An API for binding "Action" listeners to DOM Elements. Actions are like Events, but can
 * occur over time, and have a richer description than regular Events.
 */
export default class ActionListener {
    /**
     * Delegates a particular Action binding on an Element.
     */
    public static add (query: Query, action: ActionType): void {
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
     * Binds a singular click event handler on a Query to manage
     * both single-click and double-click Actions.
     */
    private static delegateClick (query: Query): void {
        query.on('click.ActionListener', (e: MouseEvent) => {
            var actions: ActionStore = Data.getData(<Element>e.currentTarget).actions;

            if (actions.last) {
                var delay: number = Time.since(actions.last.timestamp);

                if (actions.last.type === ActionType.CLICK && delay < 250) {
                    var doubleClickAction: DoubleClickAction = new DoubleClickAction(e, delay);

                    actions.trigger(ActionType.DOUBLE_CLICK, doubleClickAction);

                    return;
                }
            }

            var click: ClickAction = new ClickAction(e);

            actions.trigger(ActionType.CLICK, click);
        });
    }

    /**
     * Binds a 'contextmenu' event handler on a Query to manage right-click Actions.
     */
    private static delegateRightClick (query: Query): void {
        query.on('contextmenu.ActionListener', (e: MouseEvent) => {
            var clickAction: ClickAction = new ClickAction(e);
            clickAction.type = ActionType.RIGHT_CLICK;

            Data.getData(<Element>e.currentTarget).actions.trigger(ActionType.RIGHT_CLICK, clickAction);
            e.preventDefault();
        });
    }

    /**
     * Binds a 'mousemove' event handler on a Query to manage move Actions.
     */
    private static delegateMove (query: Query): void {
        var moveAction: MoveAction;
        var lastMoveEvent: number = 0;

        query.on('mousemove.ActionListener', (e: MouseEvent) => {
            if (Time.since(lastMoveEvent) > 1000) {
                moveAction = new MoveAction(e);
            } else {
                moveAction.update(e.clientX, e.clientY);
            }

            lastMoveEvent = Date.now();

            Data.getData(<Element>e.currentTarget).actions.trigger(ActionType.MOVE, moveAction);
        });
    }

    /**
     * Binds a 'mousedown' event handler on a Query which uses additional body
     * event handlers to monitor and manage drag Actions.
     */
    private static delegateDrag (query: Query): void {
        query.on('mousedown.ActionListener', (e: MouseEvent) => {
            var actions: ActionStore = Data.getData(<Element>e.currentTarget).actions;
            var dragAction: DragAction = new DragAction(e);

            $('body').on('mousemove.ActionListener', (e: MouseEvent) => {
                dragAction.update(e.clientX, e.clientY);
                actions.trigger(ActionType.DRAG, dragAction);
            });

            $('body').on('mouseup.ActionListener', function (e: MouseEvent) {
                $(this).off('mousemove.ActionListener mouseup.ActionListener');
            });
        });
    }
}