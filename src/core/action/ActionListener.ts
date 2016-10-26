import Data from "core/dom/data/Data";
import Time from "core/system/Time";
import ActionStore from "core/dom/data/ActionStore";

import { Query } from "core/dom/Query";
import { ActionType, Action } from "core/action/Action";
import { ClickAction, DoubleClickAction, MoveAction, DragAction } from "core/action/MouseActions";
import { Hash, ActionHandler } from "core/system/Types";

/**
 * @ public class ActionListener
 */
export default class ActionListener {
    /**
     * Delegates all Action bindings on an Element.
     */
    public static register (query: Query): void {
        this.delegateClick(query);
        this.delegateRightClick(query);
        this.delegateMove(query);
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
                    var doubleClick: Action = new DoubleClickAction(<Element>e.target, e.clientX, e.clientY, delay);

                    actions.trigger(ActionType.DOUBLE_CLICK, doubleClick);

                    return;
                }
            }

            var click: Action = new ClickAction(<Element>e.target, e.clientX, e.clientY);

            actions.trigger(ActionType.CLICK, click);
        });
    }

    private static delegateRightClick (query: Query): void {

    }

    private static delegateMove (query: Query): void {

    }
}