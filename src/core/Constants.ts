/**
 * Action type constants
 */
export type ActionT = "click" | "drag" | "move";

export const CLICK_ACTION: ActionT = "click";
export const MOVE_ACTION: ActionT = "move";
export const DRAG_ACTION: ActionT = "drag";

/**
 * Formula constants
 */
export const TUNING_CONSTANT: number = Math.pow(2, 1/12);