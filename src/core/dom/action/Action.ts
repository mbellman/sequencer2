/**
 * A list of Action types.
 */
export const enum ActionType {
    CLICK,
	DOUBLE_CLICK,
	RIGHT_CLICK,
    MOVE,
    DRAG
}

/**
 * A base template for describing any kind of user input action.
 */
export abstract class Action {
	public type: ActionType;
	public timestamp: number;

	constructor (type: ActionType) {
		this.type = type;
		this.timestamp = Date.now();
	}
}