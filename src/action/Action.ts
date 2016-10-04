abstract class Action {
	public type: string;
	public timestamp: number;

	constructor () {
		this.timestamp = Date.now();
	}
}

export default Action;