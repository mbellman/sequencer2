/**
 * @ public class SyntheticEvent
 * 
 * A fake Event instance with custom properties.
 */
export default class SyntheticEvent extends Event {
    constructor (type: string) {
        super(type);
    }
}