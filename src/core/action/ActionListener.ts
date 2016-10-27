import Data from "core/dom/data/Data";
import Time from "core/system/Time";
import ActionStore from "core/dom/data/ActionStore";

import $, { Query } from "core/dom/Query";
import { ActionType, Action } from "core/action/Action";
import { ClickAction, DoubleClickAction, MoveAction, DragAction } from "core/action/MouseActions";

/**
 * @ public class ActionListener
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
     * Binds a singular click event handler on a Query which will be used to manage
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

    private static delegateRightClick (query: Query): void {
        query.on('contextmenu.ActionListener', (e: MouseEvent) => {
            var clickAction: Action = new ClickAction(e);
            clickAction.type = ActionType.RIGHT_CLICK;

            Data.getData(<Element>e.currentTarget).actions.trigger(ActionType.RIGHT_CLICK, clickAction);

            e.preventDefault();
        });
    }

    private static delegateMove (query: Query): void {
        var moveAction: MoveAction;
        var lastUpdate: number = 0;

        query.on('mousemove.ActionListener', (e: MouseEvent) => {
            if (Time.since(lastUpdate) > 1000) {
                moveAction = new MoveAction(e);
            } else {
                moveAction.update(e.clientX, e.clientY);
            }

            lastUpdate = Date.now();

            Data.getData(<Element>e.currentTarget).actions.trigger(ActionType.MOVE, moveAction);
        });
    }

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