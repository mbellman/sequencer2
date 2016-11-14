import Time from "core/system/Time";
import Data from "core/dom/data/Data";
import ActionStore from "core/dom/data/ActionStore";

import { each } from "core/system/Utilities";
import { Hash } from "core/system/structures/Types";
import { ActionType } from "core/dom/action/Action";
import { ClickAction, DoubleClickAction, MoveAction, DragAction } from "core/dom/action/MouseActions";
import { $, DOMListenerTable, DOMListenerManager } from "core/dom/DOM";

/**
 * An API for binding "Action" listeners to DOM Elements. Actions are like Events, but can
 * occur over time, and have a richer description than regular Events. Due to the manner
 * in which the event bindings controlling the actual Action bindings can overlap, Actions
 * can be bound individually but only unbound collectively.
 * 
 * This API is leveraged by Query, and should not be used manually.
 */
export default class ActionListenerManager implements DOMListenerManager {
    /* A Hash of DOMListenerTables for each Element, where each key is the Element's unique data ID. */
    private listeners: Hash<DOMListenerTable> = {};

    /**
     * Determines whether a specific action has been bound on an Element.
     */
    public isListening (element: Element, action: ActionType): boolean {
        var id: string = Data.getId(element);

        return !!this.listeners[id] && !!this.listeners[id][action];
    }

    /**
     * Delegates a particular Action binding on an Element.
     * @implements (DOMListenerManager)
     */
    public add (element: Element, action: ActionType): void {
        switch (action) {
            case ActionType.CLICK:
            case ActionType.DOUBLE_CLICK:
                this.delegateClick(element);
                break;
            case ActionType.RIGHT_CLICK:
                this.delegateRightClick(element);
                break;
            case ActionType.MOVE:
                this.delegateMove(element);
                break;
            case ActionType.DRAG_START:
            case ActionType.DRAG:
            case ActionType.DRAG_END:
                this.delegateDrag(element);
                break;
            default:
                break;
        }
    }

    /**
     * Removes all Action bindings on an Element.
     * @implements (DOMListenerManager)
     */
    public remove (element: Element): void {
        var id: string = Data.getId(element);

        delete this.listeners[id];

        $(element).off('click.ActionListenerManager')
            .off('contextmenu.ActionListenerManager')
            .off('mousemove.ActionListenerManager')
            .off('mousedown.ActionListenerManager');
    }

    /**
     * Binds a singular click event handler on an Element to manage
     * both single-click and double-click Actions.
     */
    private delegateClick (element: Element): void {
        this.listenTo(element, [ActionType.CLICK, ActionType.DOUBLE_CLICK]);

        $(element).on('click.ActionListenerManager', (e: MouseEvent) => {
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
     * Binds a 'contextmenu' event handler on an Element to manage right-click Actions.
     */
    private delegateRightClick (element: Element): void {
        this.listenTo(element, [ActionType.RIGHT_CLICK]);

        $(element).on('contextmenu.ActionListenerManager', (e: MouseEvent) => {
            var clickAction: ClickAction = new ClickAction(e);
            clickAction.type = ActionType.RIGHT_CLICK;

            Data.getData(<Element>e.currentTarget).actions.fire(ActionType.RIGHT_CLICK, clickAction);
            e.preventDefault();
        });
    }

    /**
     * Binds a 'mousemove' event handler on an Element to manage move Actions.
     */
    private delegateMove (element: Element): void {
        this.listenTo(element, [ActionType.MOVE]);

        var moveAction: MoveAction;
        var lastMoveTime: number = 0;

        $(element).on('mousemove.ActionListenerManager', (e: MouseEvent) => {
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
     * Binds a 'mousedown' event handler on an Element which uses additional body
     * event handlers to monitor and manage drag Actions.
     */
    private delegateDrag (element: Element): void {
        this.listenTo(element, [ActionType.DRAG_START, ActionType.DRAG, ActionType.DRAG_END]);

        $(element).on('mousedown.ActionListenerManager', (e: MouseEvent) => {
            var actions: ActionStore = Data.getData(<Element>e.currentTarget).actions;
            var dragAction: DragAction = new DragAction(e);

            actions.fire(ActionType.DRAG_START, dragAction);

            $('body').on('mousemove.ActionListenerManager', (e: MouseEvent) => {
                dragAction.update(e.clientX, e.clientY);
                actions.fire(ActionType.DRAG, dragAction);
            });

            $('body').on('mouseup.ActionListenerManager', function (e: MouseEvent) {
                actions.fire(ActionType.DRAG_END, dragAction);
                $(this).off('mousemove.ActionListenerManager mouseup.ActionListenerManager');
            });
        });
    }

    /**
     * Registers specific Actions as active on Elements in the internal {listeners} table.
     */
    private listenTo (element: Element, actions: Array<ActionType>): void {
        var id: string = Data.getId(element);

        if (!this.listeners[id]) {
            this.listeners[id] = {};
        }

        each(actions, (action: ActionType) => {
            this.listeners[id][action] = true;
        });
    }
}