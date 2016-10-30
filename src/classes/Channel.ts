/**
 * @ public class Channel
 */
export default class Channel {
    private name: string;

    constructor () {
        this.name = this.generateName();
    }
    
    public getName (): string {
        return this.name;
    }

    private generateName (): string {
        return 'channel-' + Math.random();
    }
}