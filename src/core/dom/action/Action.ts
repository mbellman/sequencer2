/**
 * A list of Action types.
 */
export const enum ActionType {
    CLICK,
	DOUBLE_CLICK,
	RIGHT_CLICK,
    MOVE,
	DRAG_START,
    DRAG,
	DRAG_END
}

/**
 * A base template for describing any kind of user input action.
 */
export abstract class Action {
	/* The type of Action. */
	public type: ActionType;

	/* The time of Action instantiation in unix epoch milliseconds. */
	public timestamp: number;

	/**
	 * @constructor
	 */
	constructor (type: ActionType) {
		this.type = type;
		this.timestamp = Date.now();
	}
}