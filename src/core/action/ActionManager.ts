import { Query } from "core/dom/Query";
import { ActionType, Action } from "core/action/Action";
import { ClickAction, MoveAction, DragAction } from "core/action/MouseActions";
import { ActionHandler } from "core/system/Types";

export default class ActionManager {
    public static delegate (query: Query, action: ActionType, handler: ActionHandler): void {
        var delegator: Function = this.getDelegatorMethod(action);

        delegator(query, action, handler);
    }

    private static getDelegatorMethod (action: ActionType): Function {
        switch (action) {
            case ActionType.CLICK:
                return this.delegateClick;
            case ActionType.DOUBLE_CLICK:
                return this.delegateDoubleClick;
            case ActionType.RIGHT_CLICK:
                return this.delegateRightClick;
            case ActionType.DRAG:
                return this.delegateDrag;
            case ActionType.MOVE:
                return this.delegateMove;
        }
    }

    private static delegateClick (): void {

    }

    private static delegateDoubleClick (): void {

    }

    private static delegateRightClick (): void {

    }

    private static delegateMove (): void {

    }

    private static delegateDrag (): void {

    }
}